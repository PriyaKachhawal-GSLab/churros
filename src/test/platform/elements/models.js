'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const schema = require('./assets/element.elementmodel.schema.json');
const payload = require('core/tools').requirePayload(`${__dirname}/assets/element.elementmodel.payload.json`);
const chakram = require('chakram');
const expect = chakram.expect;

const opts = { payload: payload, schema: schema };

const crudsObject = (url, schema, createPayload, updatePayload) => {
  let object;
  return cloud.post(url, createPayload, schema)
    .then(r => object = r.body)
    .then(r => cloud.get(url + '/' + object.id))
    .then(r => cloud.put(url + '/' + object.id, updatePayload, schema))
    .then(r => cloud.delete(url + '/' + object.id));
};

const genObject = (options) => {
  let newPayload = payload || {};
  newPayload.createdDateName = (options.createdDateName || 'created_dt');
  newPayload.resources = (options.resources || []);
  return newPayload;
};

suite.forPlatform('elements/models', opts, (test) => {
  let element, keyUrl, idUrl, resourceId;
  before(() => cloud.get(`elements/closeio`)
    .then(r => element = r.body)
    .then(r => keyUrl = `elements/${element.key}/models`)
    .then(r => idUrl = `elements/${element.id}/models`)
    .then(r => cloud.get(`elements/${element.id}/resources`))
    .then(r => resourceId = r.body[0].id));

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

  it('should support CRUD for models with an associated resource', () => crudsObject(idUrl, schema, genObject({resources:[{id:resourceId}]}), genObject({ createdDateName: "created_date", resources:[{id:resourceId}]})));

});
