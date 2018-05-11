'use strict';

const cloud = require('core/cloud');
const objectPayload = require('core/tools').requirePayload(`${__dirname}/element.object.payload.json`);

var exports = module.exports = {};

/**
 * Delete by key and ignore the response
 * @param  {string}  key The element key
 * @return {promise} A JS promise
 */
exports.deleteElementByKey = (key) => cloud.delete(`/elements/${key}`, () => {});

exports.genElement = (opts) => ({
  name: (opts.name || 'Churros'),
  description: (opts.description || "A Churros element"),
  authentication: (opts.authentication) || { type: 'basic' },
  configuration: (opts.configuration) || [exports.genBaseUrlConfig({})],
  modelType: 'basic'
});

exports.genElementWithObjects = (opts) => ({
  name: (opts.name || 'Churros'),
  description: (opts.description || "A Churros element"),
  authentication: (opts.authentication) || { type: 'basic' },
  configuration: (opts.configuration) || [exports.genBaseUrlConfig({})],
  objects: [objectPayload]
});

exports.genDBElement = (opts) => ({
  name: (opts.name || 'Churros DB element'),
  description: (opts.description || "A Churros database element"),
  authentication: (opts.authentication) || { type: 'custom' },
  protocolType: (opts.protocolType) || 'jdbc',
  configuration: (opts.configuration) || [exports.genJdbcBaseUrlConfig({})]
});

exports.genConfig = (opts) => new Object({
  name: (opts.name || 'Churros Config'),
  key: (opts.key || 'churros.config'),
  description: (opts.description || 'A Churros config'),
  type: 'BOOLEAN'
});

exports.genBaseUrlConfig = (opts) => new Object({
  name: (opts.name || 'Base URL'),
  key: 'base.url',
  description: (opts.description || 'The base URL'),
  defaultValue: 'http://fake.churros.url.com',
  type: 'TEXTFIELD_1000'
});

exports.genJdbcBaseUrlConfig = (opts) => new Object({
  name: (opts.name || 'Base URL'),
  key: 'base.url',
  description: (opts.description || 'The Jdbc base URL'),
  defaultValue: 'jdbc:postgresql://{db.host}/{db.name}',
  type: 'TEXTFIELD_1000'
});

exports.genResource = (opts) => {
  opts = opts || {};
  opts.path = (opts.path || '/churros');
  opts.method = (opts.method || 'GET');
  opts.vendorPath = (opts.path || '/getChurros');
  opts.vendorMethod = (opts.vendorMethod || 'GET');
  opts.description = (opts.description || 'A Churros resource');
  opts.response = (opts.response || null);
  return opts;
};

exports.genParameter = (opts) => new Object({
  name: (opts.name || 'param'),
  type: (opts.type || 'query'),
  vendorName: (opts.vendorName || 'theParam'),
  vendorType: (opts.vendorType || 'query'),
  description: (opts.description || 'A Churros parmeter'),
  sampleData: (opts.sampleData || null),
  dataType: 'string',
  vendorDataType: 'string'
});

exports.genModel = (opts) => new Object({
  name: (opts.name || 'model'),
  swagger: (opts.swagger) || {}
});

exports.genModelWithRequestSwagger = (opts) => new Object({
  name: (opts.name || 'model'),
  swagger: (opts.swagger) || {},
  requestName: (opts.requestName || 'body'),
  requestSwagger: (opts.swagger) || {}
});

const genHook = (opts, body) => {
  opts = (opts || {});
  return {
    mimeType: (opts.mimeType || 'application/javascript'),
    type: (opts.type || 'preRequest'),
    body: (opts.body || 'done(foo: \'bar\');')
  };
};
exports.genHook = genHook;

exports.genLegacyHook = (opts) => {
  opts = (opts || {});
  opts.body = 'return {"hello": "world"}';
  const hook = genHook(opts);
  hook.isLegacy = true;
  return hook;
};

exports.genUpgradedHook = (opts) => {
  const hook = genHook(opts);
  hook.isLegacy = false;
  return hook;
};

exports.crudSubResource = (url, schema, listSchema, payload, updatePayload) => {
  let subResource;
  return cloud.post(url, payload, schema)
    .then(r => subResource = r.body)
    .then(r => cloud.get(url, listSchema))
    .then(r => cloud.put(url + '/' + subResource.id, updatePayload, schema))
    .then(r => cloud.delete(url + '/' + subResource.id))
    .catch(e => {
      if (subResource) cloud.delete(url + '/' + subResource.id);
      throw new Error(e);
    });
};


exports.crudsResource = (url, schema, listSchema, payload, updatePayload) => {
  let subResource;
  return cloud.post(url, payload, schema)
    .then(r => subResource = r.body)
    .then(r => cloud.get(url + '/' + subResource.id))
    .then(r => cloud.get(url, listSchema))
    .then(r => cloud.put(url + '/' + subResource.id, updatePayload, schema))
    .then(r => cloud.delete(url + '/' + subResource.id))
    .catch(e => {
      if (subResource) cloud.delete(url + '/' + subResource.id);
      throw new Error(e);
    });
};
