'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const fieldSchema = require('./assets/element.elementmodelfield.schema.json');
const modelpayload = require('core/tools').requirePayload(`${__dirname}/assets/element.elementmodel.payload.json`);
const fieldPayload = require('core/tools').requirePayload(`${__dirname}/assets/element.elementmodelfield.payload.json`);

const putReadObject = (url, payload) => {
  let object;
  return cloud
    .put(url, payload, fieldSchema)
    .then(r => (object = r.body[0]))
    .then(r => cloud.get(url + '/' + object.id))
    .then(r =>
      cloud.put(
        url,
        {
          data: [],
          commitMessage: 'deleted things'
        },
        fieldSchema
      )
    );
};

const genObject = opts => {
  let newPayload = fieldPayload;
  if (opts.relatedModelId) {
    newPayload.data[0].relatedModelId = opts.relatedModelId;
  }
  return newPayload;
};

suite.forPlatform('elements/modelfields', {payload: fieldPayload, schema: fieldSchema}, function(test) {
  let element, keyUrl, idUrl, modelId, idUrlWithModel, newModelId, keyUrlWithModel;
  before(function() {
    return cloud
      .get(`elements/closeio`)
      .then(r => {
        element = r.body;
        keyUrl = `elements/${element.key}/models`;
        idUrl = `elements/${element.id}/models`;
      })
      .then(r => cloud.post(idUrl, Object.assign({}, modelpayload, {name: modelpayload.name + '2'})))
      .then(r => {
        modelId = r.body.id;
        idUrlWithModel = `${idUrl}/${modelId}`;
      })
      .then(r => cloud.post(keyUrl, modelpayload))
      .then(r => {
        newModelId = r.body.id;
        keyUrlWithModel = `${keyUrl}/${newModelId}`;
      });
  });

  after(function() {
    return cloud.delete(idUrlWithModel).then(r => cloud.delete(keyUrlWithModel));
  });

  it('should support RU for fields', function() {
    return putReadObject(idUrlWithModel + '/fields', genObject({relatedModelId: newModelId})).then(function() {
      return putReadObject(keyUrlWithModel + '/fields', genObject({relatedModelId: modelId}));
    });
  });
});