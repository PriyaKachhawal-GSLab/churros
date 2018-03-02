'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const schema = require('./assets/element.elementmodel.schema.json');
const modelpayload = require('core/tools').requirePayload(`${__dirname}/assets/element.elementmodel.payload.json`);
const fieldPayload = require('core/tools').requirePayload(`${__dirname}/assets/element.elementmodelfield.payload.json`);

const opts = {payload: fieldPayload, schema: schema};

const putReadObject = (url, schema, fieldPayload, updatePayload) => {
  let object;
  return cloud
    .put(url, fieldPayload, schema)
    .then(r => (object = r.body))
    .then(r => cloud.get(url + '/' + object.id))
    .then(r =>
      cloud.put(
        url,
        {
          data: [],
          commitMessage: 'deleted things'
        },
        schema
      )
    );
};

const genObject = opts => {
  let newPayload = fieldPayload || {};
  newPayload.createdDateName = opts.createdDateName || 'created_dt';
  newPayload.relationships = opts.relationships || [];
  return newPayload;
};

suite.forPlatform('elements/modelfields', opts, test => {
  let element, keyUrl, idUrl, modelId, idUrlWithModel, newModelId, keyUrlWithModel;
  before(() =>
    cloud
      .get(`elements/closeio`)
      .then(r => {
        element = r.body;
        keyUrl = `elements/${element.key}/models`;
        idUrl = `elements/${element.id}/models`;
      })
      .then(r => cloud.post(idUrl, modelpayload))
      .then(r => {
        modelId = r.body.id;
        idUrlWithModel = `${idUrl}/${modelId}`;
      })
      .then(r => cloud.post(keyUrl, modelpayload))
      .then(r => {
        newModelId = r.body.id;
        keyUrlWithModel = `${keyUrl}/${newModelId}`;
      })
  );

  after(() => {
    return cloud.delete(idUrlWithModel).then(r => cloud.delete(`elements/${element.id}/models/${newModelId}`));
  });

  it('should support RU for fields', () => {
    putReadObject(
      idUrlWithModel + '/fields',
      schema,
      genObject({relationships: [newModelId]}),
      genObject({createdDateName: 'created_date', relationships: [newModelId]})
    );
  });
});