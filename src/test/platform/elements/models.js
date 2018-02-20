'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const schema = require('./assets/element.elementmodel.schema.json');
const payload = require('core/tools').requirePayload(`${__dirname}/assets/element.elementmodelfield.payload.json`);
const chakram = require('chakram');
const expect = chakram.expect;

const opts = { payload: payload, schema: schema };

const crudsObject = (url, schema, payload, updatePayload) => {
  let object;
  return cloud.post(url, payload, schema)
    .then(r => object = r.body)
    .then(r => cloud.get(url + '/' + object.id))
    .then(r => cloud.put(url + '/' + object.id, updatePayload, schema))
    .then(r => cloud.delete(url + '/' + object.id));
};

const genObject = (opts) => {
  const newPayload = payload || {};
  newPayload.createdDateName = (opts.createdDateName || 'created_dt');
  return newPayload;
};

suite.forPlatform('elements/models', opts, (test) => {
  let element, keyUrl, idUrl;
  before(() => cloud.get(`elements/closeio`)
    .then(r => element = r.body)
    .then(r => keyUrl = `elements/${element.key}/models`)
    .then(r => idUrl = `elements/${element.id}/models`));

  it('should support CRUD for models', () => crudsObject(idUrl, schema, genObject({}), genObject({ createdDateName: "created_date" })));

  it('should support upserting a model', () => {
    let modelId;

    return cloud.put(`/elements/${element.key}/models`, genObject({}))
        .then(r => {
          expect(r.body.name).to.equal(payload.name);
          modelId = r.body.id;
        })
        .then(() => cloud.put(`/elements/${element.key}/models`, genObject({})))
        .then(r => {
          expect(r.body.id).to.equal(modelId);
          expect(r.body.name).to.equal(payload.name);
        })
        .then(() => cloud.delete(`/elements/${element.key}/models/${modelId}`));
  });
});