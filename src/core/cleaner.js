/**
 *  @namespace MyNamespace
 * @module core/cleaner
 */
'use strict';

const cloud = require('core/cloud');
const logger = require('winston');
const moment = require('moment');
const chakram = require('chakram');
const expect = chakram.expect;

var exports = module.exports = {};

const ignore = (response) => {
  logger.debug(`Ignoring HTTP response`);
  return response;
};

const filter = (rs, field, values) => {
  return rs.body.filter(r => {
    let isFound = false;
    logger.debug(`Looking to see if ${r[field]} is in ${values}`);
    values.forEach(value => isFound = (isFound || r[field] === value));
    return isFound;
  });
};

const deleteAll = (resource, ids) => {
  if (!ids || ids.length <= 0) return;
  logger.debug(`Attempting to delete ${resource} with id ${ids[0]}`);
  return cloud.delete(`/${resource}/${ids[0]}`, ignore)
    .then(r => ids.shift())
    .then(r => deleteAll(resource, ids));
};

const cleanFormulas = (field, values) => {
  logger.debug(`Cleaning formulas where ${field} is set to one of ${values}`);
  return cloud.get(`/formulas`)
    .then(rs => filter(rs, field, values))
    .then(rs => {
      return Promise.all(rs.map(r => cloud.get(`/formulas/${r.id}/instances`)))
        .then(rs => {
          // concat them all together
          let instances = [];
          rs.map(r => instances = instances.concat(r.body));
          logger.debug(`Concatenated formulas instances into ${JSON.stringify(instances)}`);
          return instances;
        })
        .then(rs => Promise.all(rs.map(r => cloud.delete(`/formulas/${r.formula.id}/instances/${r.id}`))))
        .then(() => Promise.all(rs.map(f =>
          cloud.delete(`/formulas/${f.id}`)
            // retry if fail due to async formula instance delete
            .catch(e => new Promise(resolve => setTimeout(resolve, 1000))
              .then(() => {
                logger.debug(`Attempting retry of formula ${f.id} delete`);
                return cloud.delete(`/formulas/${f.id}`)
              })
            ))
          ))
    });
};

const cleanElements = (field, values) => {
  logger.debug(`Cleaning element instances where ${field} is set to one of ${values}`);
  return cloud.get(`/instances`)
    .then(rs => filter(rs, field, values))
    .then(rs => deleteAll('instances', rs.map(r => r.id)));
};

const cleanElementsBefore = () => {
  return cloud.get('/instances')
  .then(r => filter(r, 'name', ['churros-instance']))
  // only delete if hour old
  .then(r => r.filter(obj => moment.utc().valueOf() - Date.parse(obj.createdDate) - 3.6e+6 > 0))
  .then(r => deleteAll('instances', r.map(r => r.id))).catch(() => logger.debug('failed to clean up before'));
};
exports.cleanElementsBefore = () => cleanElementsBefore();

const cleanIntegrations = (field, values) => {
  logger.debug(`Cleaning integrations where ${field} is set to one of ${values}`);
  return cloud.get('/integrations')
    .then(rs => filter(rs, field, values))
    .then(rs => deleteAll('integrations', rs.map(r => r.id)));
};

const toArray = (value) => Array.isArray(value) ? value : [value];

/**
 * The formula module
 * @namespace formulas
 */
exports.formulas = {
  /**
   * Clean up all with the name of the formula
   * @param {string} name The name of the formula
   * @return {Promise} A promise that will resolve once all formulas have been deleted
   * @memberof module:core/cleaner~formulas
   */
  withName: (name) => cleanFormulas('name', toArray(name))
};

/**
 * The elements module
 * @namespace elements
 */
exports.elements = {
  /**
   * Clean up elements with the given name
   * @param  {string} name The name of the element
   * @return {Promise}
   * @memberof module:core/cleaner~elements
   */
  withName: (name) => cleanElements('name', toArray(name))
};

/**
 * The integrations module
 * @namespace integrations
 */
exports.integrations = {
  /**
   * Clean up integrations with the given name
   * @param {string} name The name of the integrations
   * @return {Promise}
   * @memberof module:core/cleaner~integrations
   */
  withName: (name) => cleanIntegrations('name', toArray(name))
};
