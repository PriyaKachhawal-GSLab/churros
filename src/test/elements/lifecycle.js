'use strict';

const cloud = require('core/cloud');
const expect = require('chakram').expect;
const util = require('util');
const provisioner = require('core/provisioner');
const tools = require('core/tools');
const defaults = require('core/defaults');
const cleaner = require('core/cleaner');
const argv = require('optimist').argv;
const fs = require('fs');
const logger = require('winston');
const props = require('core/props');

const createAll = (urlTemplate, list) => {
  return Object.keys(list).sort()
    .reduce((p, key) => p.then(() => {
      return cloud.post(util.format(urlTemplate, key), list[key])
      .catch(err => cloud.post(util.format(urlTemplate, key), list[key]));
    }), Promise.resolve(true)); // initial
};

const terminate = error => {
  logger.error('Failed to initialize element: %s', error);
  process.exit(1);
};

let element = argv.element;
let instanceId, hub;
let deleteInstance = !argv.save; //we don't always want to delete. Defaults to true
// Setting which element we are currently running on
props.set('element', element);
before(() => {
  tools.resetCleanup();
  logger.info('Using url: %s', props.get('url'));
  logger.info('Using user: %s', props.get('user'));
  if (props.getOptionalForKey(element, 'username')) logger.info('Using oauth username: %s', props.getOptionalForKey(element, 'username'));
  if (props.getOptionalForKey(element, 'oauth.api.key')) logger.info('Using api key: %s', props.getOptionalForKey(element, 'oauth.api.key'));
  logger.info('Running tests for element: %s', element);
  if (props.getOptionalForKey(argv.element, 'skip') === true) {
    logger.info('Skip provisioning and all tests for %s', element);
    return {};
  }
  return tools.runFile(element, `${__dirname}/${element}/assets/scripts.js`, 'before')
  .then(() => !argv.save ? cleaner.cleanElementsBefore() : null)
  .then(() => {
    let getInstance;
    if (argv.instance) {
      getInstance = cloud.get(`/instances/${argv.instance}`)
      .then(r => {
        defaults.token(r.body.token);
        expect(r.body.element.key).to.equal(tools.getBaseElement(element));
        deleteInstance = false;
        return r;
      });
    } else if (argv.backup === 'only backup') {
      deleteInstance = false;
      getInstance = provisioner.getBackup(element);
    } else {
      getInstance = provisioner.create(element)
      .catch(e => {
        if (argv.backup === 'use backup') { //if default flag
          deleteInstance = false;
          return provisioner.getBackup(element);
        } else {
          throw Error(e);
        }
      });
    }

    return getInstance
      .then(r => {
        expect(r).to.have.statusCode(200);
        logger.info('Provisioned with instance id of ' + r.body.id);
        instanceId = r.body.id;
        props.set('instanceId', instanceId);
        hub = r.body.element.hub;
        props.set('hub', hub);
        element = tools.getBaseElement(element);
        props.setForKey(element, 'elementId', r.body.element.id);
        props.set('instanceName', r.body.name);
        // object definitions file exists? create the object definitions on the instance
        const objectDefinitionsFile = `${__dirname}/assets/object.definitions`;
        if (fs.existsSync(objectDefinitionsFile + '.json')) {
          logger.debug('Setting up object definitions');
          const url = `/instances/${instanceId}/objects/%s/definitions`;

          // only create object definitions for the resources that are being transformed for this element.  If there
          // aren't any transformations, no need to create any object definitions.
          const transformationsFile = `${__dirname}/${element}/assets/transformations`;
          if (argv.transform === true && !fs.existsSync(transformationsFile + '.json')) {
            let allDefs = require(objectDefinitionsFile);
            let defined = Object.keys(allDefs);
            return cloud.get(`/hubs/${hub}/objects`)
            .then(objs => {
              let transDefs = defined.reduce((acc, cur) => {
                if (objs.body.includes(cur)) {
                  acc[cur] = allDefs[cur];
                }
                return acc;
              },{});
              return createAll(url, transDefs)
              .catch(() => {});
            });
          } else if (!fs.existsSync(transformationsFile + '.json')) {
            logger.debug(`No transformations found for ${element} so not going to create object definitions`);
            return null;
          } else {
            const transformations = require(transformationsFile);
            const allObjectDefinitions = require(objectDefinitionsFile);
            const objectDefinitions = Object.keys(allObjectDefinitions)
              .reduce((accum, objectDefinitionName) => {
                if (transformations[objectDefinitionName]) {
                  accum[objectDefinitionName] = allObjectDefinitions[objectDefinitionName];
                }
                return accum;
              }, {});

            return createAll(url, objectDefinitions)
            .catch(() => {});
          }
        }
      })
      .then(r => {
        const transformationsFile = `${__dirname}/${element}/assets/transformations`;
        props.setForKey(element, 'transformed', []);
        let objsTransformed = props.getForKey(element, 'transformed');
        if (argv.transform && fs.existsSync(transformationsFile + '.json')) {
          let transformations = require(transformationsFile + '.json');
          Object.keys(transformations).forEach(key => {
            let idFields = transformations[key].fields.filter(f => f.path === 'id');
            if (idFields.length > 0) {
              idFields.forEach(idField => idField.path = 'idTransformed');
            } else {
              transformations[key].fields.push({"path": "idTransformed","vendorPath": "id"});
            }
          });

          return Object.keys(transformations).sort()
            .reduce((p, key) => p.then(() => {
              return cloud.post(util.format(`/instances/${instanceId}/transformations/%s`, key), transformations[key])
              .then(() => objsTransformed.push(key))
              .catch(() => {});
            }), Promise.resolve(true)); // initial
        } else if (argv.transform && !fs.existsSync(transformationsFile + '.json')) {
          let allDefs = require(`${__dirname}/assets/object.definitions.json`);
          let defined = Object.keys(allDefs);
          return cloud.get(`/hubs/${hub}/objects`)
          .then(objs => {
            return objs.body.sort()
              .reduce((p, key) => p.then(() => {
                let trans = {
                  "vendorName": key,
                  "fields": [
                    {
                      "path": "idTransformed",
                      "vendorPath": "id"
                    }
                  ]
                };
                //creates the same transformations that were defined
                return defined.includes(key) ? cloud.post(`/instances/${instanceId}/transformations/${key}`, trans).then(() => objsTransformed.push(key)) : Promise.resolve(null);
              }), Promise.resolve(true)); // initial
          });
        } else {
          // transformations file exists? create the transformations on the instance
          if (fs.existsSync(transformationsFile + '.json')) {
            logger.debug('Setting up transformations');
            const url = `/instances/${instanceId}/transformations/%s`;
            return createAll(url, require(transformationsFile))
            .catch(() => {});
          }
        }
      })
      .catch(r => {
        return instanceId && deleteInstance ? provisioner.delete(instanceId).then(() => terminate(r)).catch(() => terminate(r)) : terminate(r);
      });
    });
});

after(done => {
  tools.resetCleanup();
  instanceId && deleteInstance ? provisioner
        .delete(instanceId)
        .then(() => done())
        .catch(r => logger.error('Failed to delete element instance: %s', r))
    : done();
});
