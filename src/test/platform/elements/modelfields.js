'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const modelSchema = require('./assets/element.elementmodel.schema.json');
const modelPayload = require('core/tools').requirePayload(`${__dirname}/assets/element.elementmodel.payload.json`);
const fieldPayload = require('core/tools').requirePayload(`${__dirname}/assets/element.elementmodelfield.payload.json`);

const putReadObject = (url, payload) => {
  return cloud
    .put(url, payload, modelSchema)
    .then(r => cloud.get(url))
    .then(r =>
      cloud.put(
        url,
        Object.assign(r.body, {
          modelFields: [],
        }),
        modelSchema
      )
    );
};

const genObject = (opts, model) => {
  let newPayload = model;
  let newField;
  if (opts.data && opts.data.length > 0) {
    newField = opts.data[0];
  }
  return Object.assign(newPayload, {modelFields: newPayload.modelFields.concat(newField)});
};

suite.forPlatform('elements/modelfields', {payload: modelPayload, schema: modelSchema}, function(test) {
  let element, keyUrl, idUrl, modelId, idUrlWithModel, newModelId, keyUrlWithModel;
  before(function() {
    return cloud
      .get(`elements/closeio`)
      .then(r => {
        element = r.body;
        keyUrl = `elements/${element.key}/models`;
        idUrl = `elements/${element.id}/models`;
      })
      .then(r => cloud.post(idUrl, Object.assign({}, modelPayload, {name: modelPayload.name + '2'})))
      .then(r => {
        modelId = r.body.id;
        idUrlWithModel = `${idUrl}/${modelId}`;
      })
      .then(r => cloud.post(keyUrl, modelPayload))
      .then(r => {
        newModelId = r.body.id;
        keyUrlWithModel = `${keyUrl}/${newModelId}`;
      });
  });

  after(function() {
    return cloud.delete(idUrlWithModel).then(r => cloud.delete(keyUrlWithModel));
  });

  it('should support RU for fields', function() {
    return putReadObject(idUrlWithModel, genObject(fieldPayload, Object.assign({}, modelPayload, {name: modelPayload.name + '2'}))).then(function() {
      return putReadObject(keyUrlWithModel, genObject(fieldPayload, modelPayload));
    });
  });
});