'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const schema = require('./assets/element.elementmodel.schema.json');
const modelpayload = require('core/tools').requirePayload(`${__dirname}/assets/element.elementmodel.payload.json`);
const fieldPayload = require('core/tools').requirePayload(`${__dirname}/assets/element.elementmodelfield.payload.json`);

const opts = { payload: fieldPayload, schema: schema };

const crudsObject = (url, schema, fieldPayload, updatePayload) => {
  let object;
  return cloud.post(url, fieldPayload, schema)
    .then(r => object = r.body)
    .then(r => cloud.get(url + '/' + object.id))
    .then(r => cloud.put(url + '/' + object.id, updatePayload, schema))
    .then(r => cloud.delete(url + '/' + object.id));
};

const genObject = (opts) => {
  let newPayload = fieldPayload || {};
  newPayload.createdDateName = (opts.createdDateName || 'created_dt');
  newPayload.relationships = (opts.relationships || []);
  return newPayload;
};

suite.forPlatform('elements/modelfields', opts, (test) => {
  let element, keyUrl, idUrl, modelId, idUrlWithModel, newModelId;
  before(() => cloud.get(`elements/closeio`)
    .then(r => element = r.body)
    .then(r => keyUrl = `elements/${element.key}/models`)
    .then(r => idUrl = `elements/${element.id}/models`)
    .then(r => cloud.post(idUrl, fieldPayload))
    .then(r => {
      modelId = r.body.id;
      idUrlWithModel = idUrl + '/' + modelId;
    })
    .then(r => cloud.post(`elements/${element.id}/models`, modelpayload))
    .then(r => {
        newModelId = r.body.id;
      })
    );
  
  after(() => {
    return cloud.delete(idUrlWithModel)
    .then(r => cloud.delete(`elements/${element.id}/models/${newModelId}`));
  });

  it('should support CRUD by id for fields', () => crudsObject(idUrlWithModel + '/fields', schema, genObject({relationships:[newModelId]}), genObject({ createdDateName: "created_date", relationships:[newModelId] })));

});
