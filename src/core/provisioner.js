/** @module core/provisioner */
'use strict';

const expect = require('chakram').expect;
const tools = require('core/tools');
const props = require('core/props');
const urlParser = require('url');
const logger = require('winston');
const o = require('core/oauth');
const r = require('request');
const defaults = require('core/defaults');
const cloud = require('core/cloud');
const argv = require('optimist').argv;
const _ = require('ramda');

var exports = module.exports = {};

const genInstance = (config) =>
  ({
    name: config.name,
    element: { key: config.element },
    configuration: config.ec
  });

const genConfig = (props, args) => {
  const config = Object.assign({}, props, args);

  const name = (args && args.name) ? args.name : 'churros-instance';
  const tags = (args && args.tags) ? args.tags : undefined;
  delete config.name;

  return {
    ec: config,
    name: name,
    tags: tags
  };
};

const parseDefaultOauthUrlProps = element => ({
  username: props.getForKey(element, 'username'),
  password: props.getForKey(element, 'password'),
  options: {
    qs: props.get(element)
  }
});

const parseOauthUrlProps = element => {
  let args = {
    username: props.getForKey(element, 'username'),
    password: props.getForKey(element, 'password'),
    options: {
      qs: {
          apiKey: props.getForKey(element, 'oauth.api.key'),
          apiSecret: props.getForKey(element, 'oauth.api.secret'),
          callbackUrl: (props.getOptionalForKey(element, 'oauth.callback.url') || props.get('oauth.callback.url')),
          scope: props.getOptionalForKey(element, 'oauth.scope'),
          siteAddress: props.getOptionalForKey(element, 'site.address'),
          subdomain: props.getOptionalForKey(element, 'subdomain')
        }
    }
  };
  props.getOptionalForKey(element, 'extra.oauth.params') ? args.options.qs = Object.assign({}, args.options.qs, props.getOptionalForKey(element, 'extra.oauth.params')) : null;
  return args;
};

const parseProps = (element, useDefaultUrl) => {
  const args = useDefaultUrl ? parseDefaultOauthUrlProps(element) : parseOauthUrlProps(element);

  return new Promise((res, rej) => res(args));
};

const getPollerConfig = (element, instance, polling) => {
  console.log(`Polling! ${polling}`);
  if (!polling) return Promise.resolve(instance);
  let elementObj;
  return cloud.get('/elements/' + element)
  .then(r => elementObj = r.body)
  .then(r => props.setForKey(element, 'elementId', elementObj.id))
  .then(r => cloud.get(`elements/${elementObj.id}/metadata`))
  .then(r => {
    const pollsSupported = r.body.events.supported && r.body.events.methods.includes('polling');
    if (!pollsSupported) logger.error('Polling is not supported for this element.');
    return pollsSupported;
  })
  .then(r => r ? elementObj.configuration.reduce((acc, conf) => acc = conf.key === 'event.poller.configuration' ? conf.defaultValue : acc, 'NoConfig') : null)
  .then(r => {
    if (r === null) return instance;
    let instanceCopy = JSON.parse(JSON.stringify(instance));
    if (elementObj.configuration.map(conf => conf.key).includes('event.metadata')) {
      instanceCopy.configuration['event.objects'] = Object.keys(JSON.parse(elementObj.configuration
      .reduce((acc, conf) => acc = conf.key === 'event.metadata' ? conf.defaultValue : acc, {})).polling).filter(str => str !== '{objectName}').join(',');
    } else {
      if (r !== 'NoConfig') instanceCopy.configuration['event.poller.configuration'] = r.replace(/\\n/g, '').replace(/\n/g, '').replace(/\t/g, '').replace(/<PUT USERNAME HERE>/g, props.getOptionalForKey(element, 'username'));
      if (instanceCopy.configuration['event.poller.configuration']) instanceCopy.configuration["event.poller.urls"] = Object.keys(JSON.parse(instanceCopy.configuration['event.poller.configuration'])).join(element === 'hubspot' || element === 'hubspotcrm' ? '\n' : '|');
      else instanceCopy.configuration['event.poller.urls'] = elementObj.configuration.reduce((acc, conf) => acc = conf.key === 'event.poller.urls' ? conf.defaultValue : acc ,null);
    }
    instanceCopy.configuration['event.vendor.type'] = 'polling';
    instanceCopy.configuration['event.notification.callback.url'] = 'https://httpbin.org/get';
    instanceCopy.configuration['event.notification.enabled'] = 'true';
    instanceCopy.configuration['event.poller.refresh_interval'] = '1';
    instanceCopy.configuration['event.notification.signature.key'] = '';
    element === 'onedrivev2' ? instanceCopy.configuration['event.poller.urls'] = null : null;
    return instanceCopy;
  })
  .catch(() => instance);
};

const addParams = (instance, element) => {
  let instanceCopy = JSON.parse(JSON.stringify(instance));
  if (argv.params) instanceCopy.configuration = Object.assign({}, instanceCopy.configuration, JSON.parse(argv.params));
  if (element && props.getOptionalForKey(element, 'extra.oauth.params')) instanceCopy.configuration = Object.assign({}, instanceCopy.configuration, props.getOptionalForKey(element, 'extra.oauth.params'));
  return instanceCopy;
};

const addParamsToOptions = (argOptions) => {
  let optionsCopy = JSON.parse(JSON.stringify(argOptions));
  if (argv.params) optionsCopy.qs = Object.assign({}, optionsCopy.qs, JSON.parse(argv.params));
  return optionsCopy;
};

const addDebugToParams = (args, params) => {
  if (args && args.debug) params.debug = true;
  return params;
};

const getInstanceUrl = instanceId => instanceId ? `/instances/${instanceId}` : '/instances';

const createOrUpdateInstance = (element, config, providerData, baseApi, instanceId, polling) => {
  config.element = tools.getBaseElement(element);
  const instance = genInstance(config);
  const isUpdate = !!instanceId;
  const performCreateOrUpdate = isUpdate ? cloud.put : cloud.post;
  baseApi = (baseApi) ? baseApi : getInstanceUrl(instanceId);
  if (providerData) instance.providerData = providerData;
  return getPollerConfig(tools.getBaseElement(element), instance, polling)
    .then(r => performCreateOrUpdate(baseApi, addParams(r, element)))
    .then(r => {
      expect(r).to.have.statusCode(200);
      logger.debug('Created %s element instance with ID: %s', element, r.body.id);
      defaults.token(r.body.token);
      global.instanceId = r.body.id;
      tools.addCleanUp({url: `${props.get('url')}/elements/api-v2${baseApi}/${r.body.id}`, method: 'delete', secrets: defaults.secrets()});
      return r;
    })
    .catch(r => tools.logAndThrow('Failed to create an instance of %s', r, element));
};

const createExternalInstance = (element, config, providerData) => {
  const tokenUrl = config.tokenUrl;
  const apiKey = config['oauth.api.key'];
  const apiSecret = config['oauth.api.secret'];
  const callbackUrl = props.get('oauth.callback.url');
  const code = providerData.code;
  let instanceBody;

  if (!tokenUrl) {
    throw Error("Token URL must be present in the element props as 'tokenUrl'");
  }
  let instanceElement = tools.getBaseElement(element);

  return new Promise((res, rej) => {
    r.post({
      url: tokenUrl,
      form: {
        client_id: apiKey,
        client_secret: apiSecret,
        grant_type: 'authorization_code',
        redirect_uri: callbackUrl,
        code: code
      }
    }, (e, r, b) => {
      let body = JSON.parse(b);
      let refreshToken = body.refresh_token;
      instanceBody = {
        "element": {
          "key": instanceElement
        },
        "configuration": {
          "oauth.user.refresh_token": refreshToken,
          "oauth.api.key": apiKey,
          "oauth.api.secret": apiSecret,
          "oauth.resource.url": props.getOptionalForKey(element, 'site.address'),
          "site.url": props.getOptionalForKey(element, 'site.address'),
          "site.address": props.getOptionalForKey(element, 'site.address')
        },
        "name": `${element} external auth churros`,
        "externalAuthentication": "initial"
      };
      res(cloud.post('/instances', instanceBody));
    });
  });
};

const oauth = (element, args, config, elementId) => {
  const useDefaultUrl = !!elementId;
  const elementPathVar = useDefaultUrl ? elementId : tools.getBaseElement(element);
  const url = `/elements/${elementPathVar}/oauth/url${useDefaultUrl ? '/default' : ''}`;
  logger.debug('GET %s with options %s', url, JSON.stringify(addParams(args.options)));
  return cloud.withOptions(addParamsToOptions(args.options)).get(url)
    .then(r => {
      expect(r).to.have.statusCode(200);
      if(useDefaultUrl) args.secret = r.body.configuration.secret;
      return o(element, r, args.username, args.password, config);
    })
    .catch(err => {
      logger.error("OAuth exchange failed: %s", err);
      throw err;
    })
    .then(r => {
      const query = urlParser.parse(r, true).query;
      expect(query).to.not.be.null;
      const providerData = {
        code: query.code,
        apikey: query.apikey,
        access_token: query.access_token,
        refresh_token: query.refresh_token,
        expires_in: query.expires_in,
        state: query.state,
        oauth_token: query.oauth_token,
        oauth_verifier: query.oauth_verifier,
        secret: args.secret,
        realmId: query.realmId,
        dataSource: query.dataSource,
        org: query.org,
        token: query.token
      };
      if(args && args.debug) {
        providerData.debug = true;
      }
      return providerData;
    });
};

const oauth1 = (element, args) => {
  let urlElement = tools.getBaseElement(element);
  const oauthTokenUrl = `/elements/${urlElement}/oauth/token`;
  return cloud.withOptions(args.options).get(oauthTokenUrl)
    .then(r => {
      expect(r).to.have.statusCode(200);
      args.options.qs.requestToken = r.body.token;
      args.secret = r.body.secret;
      return args;
    });
};

/**
 * Handles orchestrating this create, which can flow different ways depending on what type of
 * provisioning this element support
<<<<<<< 62b086b7c27217781396aa3b754a61175800600f
 * @param  {string} element   The element key
 * @param  {object} args      The args to pass on the create instance call
 * @param  {string} baseApi   The base API
 * @param  {string} elementId The element ID to use if using the default oauth url
 * @return {Promise}         JS promise that resolves to the instance created
 */
const orchestrateCreate = (element, args, baseApi, cb, elementId) => {
  const useDefaultUrl = !!elementId;
=======
 * @param  {string} element  The element key
 * @param  {object} args     The args to pass on the create instance call
 * @param  {string} baseApi  The base API
 * @param  {boolean} polling Whether to enable polling or not
 * @return {Promise}         JS promise that resolves to the instance created
 */
const orchestrateCreate = (element, args, baseApi, cb, polling) => {
>>>>>>> New tests for job disablement
  const type = props.getOptionalForKey(element, 'provisioning');
  const config = genConfig(props.all(element), args);
  config.element = element;
  logger.debug('Attempting to provision %s using the %s provisioning flow', element, type ? type : 'standard');
  switch (type) {
    case 'oauth1':
    case 'oauth2':
      config.ec['oauth.callback.url'] = props.getOptionalForKey(element, 'oauth.callback.url') === null ?
        props.get('oauth.callback.url') :
        props.getForKey(element, 'oauth.callback.url');
      logger.debug('Using callback URL: ' + config.ec['oauth.callback.url']);
      return parseProps(element, useDefaultUrl)
        .then(r => (type === 'oauth1' && !useDefaultUrl) ? oauth1(element, r) : r)
        .then(r => addDebugToParams(args, r))
        .then(r => oauth(element, r, config.ec, elementId))
        .then(r => cb(type, config, r));
    case 'custom':
      const cp = `${__dirname}/../test/elements/${element}/provisioner`;
      return require(cp).create(config);
    default:
<<<<<<< 62b086b7c27217781396aa3b754a61175800600f
      return createOrUpdateInstance(element, config, undefined, baseApi);
=======
      return createInstance(element, config, undefined, baseApi, polling);
>>>>>>> New tests for job disablement
  }
};

/**
 * Provision an element using just the partial OAuth flow.
 * @param {string} element The element key
 * @param {Object} args Any other args to pass when provisioning the element
 * @param {string} baseApi The base API
 * @param {boolean} polling Whether to enable polling or not
 * @return {Promise}  A promise that will resolve to the response after the partial OAuth flow is complete
 */
exports.partialOauth = (element, args, baseApi, polling) => orchestrateCreate(element, args, baseApi, (type, config, r) => r.code, typeof polling === 'undefined' ? argv.polling : polling);

/**
 * Provision an element instance
 * @param {string} element The element key
 * @param {Object} args All properties that are available in churros props for this element
 * @param {string} baseApi The base API
 * @param {boolean} polling Whether to enable polling or not
 * @return {Promise}  A promise that resolves to the HTTP response after attempting to create the element instance
 */
exports.create = (element, args, baseApi, polling) => {
  const cb = (type, config, r) => {
    const external = props.getOptionalForKey(element, 'external');

    if (external && type === 'oauth2') return createExternalInstance(element, config.ec, r);
    if (external && type === 'oauth1') throw Error('External Authentication via churros is not yet implemented for OAuth1');

<<<<<<< 74a337a1727fb1f7c956ee1e58ff8aa24897c7d2
<<<<<<< 62b086b7c27217781396aa3b754a61175800600f
    return createOrUpdateInstance(element, config, r, baseApi);
  };
  return orchestrateCreate(element, args, baseApi, cb);
=======
    return createInstance(element, config, r, baseApi, polling == null ? argv.polling : polling);
  };

  return orchestrateCreate(element, args, baseApi, cb, polling == null ? argv.polling : polling);
>>>>>>> New tests for job disablement
};
/**
 * Provision an existing element instance
 * @param {string} element The element key
 * @param {Object} args All properties that are available in churros props for this element
 * @param {string} baseApi The base API
 * @param {string} instanceId The instanceId used to update the instance
 * @return {Promise}  A promise that resolves to the HTTP response after attempting to update the element instance
 */
exports.update = (element, args, baseApi, instanceId) => {
  const cb = (type, config, r) => {
    return createOrUpdateInstance(element, config, r, baseApi, instanceId);
  };
  return orchestrateCreate(element, args, baseApi, cb);
};

/**
 * Provision an element instance with the default OAuth app URL
 * @param {string} element The element key
 * @param {Object} args All properties that are available in churros props for this element
 * @param {string} baseApi The base API
 * @return {Promise}  A promise that resolves to the HTTP response after attempting to create the element instance using the default OAuth app url
 */
exports.createWithDefault = (element, args, baseApi) => {
    const cb = (type, config, r) => {
      return createOrUpdateInstance(element, config, r, baseApi);
    };
  const elementKey = tools.getBaseElement(element);
  return cloud.get(`elements/${elementKey}`)
  .then(r => r.body.id)
  .then(r => orchestrateCreate(element, args, baseApi, cb, r));
};

/**
 * Update an element instance with the default OAuth app URL
 * @param {string} element The element key
 * @param {Object} args All properties that are available in churros props for this element
 * @param {string} baseApi The base API
 * @param {string} instanceId The instanceId used to update the instance
 * @return {Promise}  A promise that resolves to the HTTP response after attempting to update the element instance using the default OAuth app url
 */
exports.updateWithDefault = (element, args, baseApi, instanceId) => {
    const cb = (type, config, r) => {
      return createOrUpdateInstance(element, config, r, baseApi, instanceId);
    };
  const elementKey = tools.getBaseElement(element);
  return cloud.get(`elements/${elementKey}`)
  .then(r => r.body.id)
  .then(r => orchestrateCreate(element, args, baseApi, cb, r));
=======
    return createInstance(element, config, r, baseApi, typeof polling === 'undefined' ? argv.polling : polling);
  };

  return orchestrateCreate(element, args, baseApi, cb, typeof polling === 'undefined' ? argv.polling : polling);
>>>>>>> Better undefined check
};


/**
 * Delete an element instance
 * @param {number} id The element instance ID
 * @param {string} baseApi The base API
 * @return {Promise}  A promise that resolves to the HTTP response after attempting to delete this element instance
 */
exports.delete = (id, baseApi) => {
  if (!id) return;

  baseApi = (baseApi) ? baseApi : '/instances';
  // when running the delete API, don't include the element token in the auth header
  const { userSecret, orgSecret } = defaults.secrets();
  const headers = { Authorization: `User ${userSecret}, Organization ${orgSecret}` };
  return cloud.withOptions({ headers }).delete(`${baseApi}/${id}`)
    .then(r => {
      logger.debug(`Deleted element instance with ID: ${id}`);
      defaults.reset();
      return r.body;
    })
    .catch(r => tools.logAndThrow('Failed to delete element instance with ID: %s', r, id));
};

exports.getBackup = (element) => {
  logger.info('Attempting to use backup');
  return cloud.get('/instances?tags%5B%5D=churros-backup&hydrate=false')
  .then(r => {
    if (!_.isEmpty(r.body) && _.type(r.body) === 'Array') {
      var instance = r.body.reduce((acc, cur) => acc = acc !== null ? acc : cur.element.key === element ? cur : null, null);
      if (instance !== null) {
        props.setForKey(element, 'elementId', instance.element.id);
        defaults.token(instance.token);
        expect(instance.element.key).to.equal(tools.getBaseElement(element));
        r.body = instance;
        return r;
      } else {
        logger.error('No "churros-backup" instance available');
      }
    } else {
      logger.error('Invalid response: ', JSON.stringify(r.body));
    }
  });
};
