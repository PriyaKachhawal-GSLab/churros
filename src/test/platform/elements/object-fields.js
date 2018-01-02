'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const schema = require('./assets/element.object.schema.json');
const payload = require('core/tools').requirePayload(`${__dirname}/assets/element.object.payload.json`);
const fieldPayload = require('./assets/element.object.field.payload.json');
const fieldSchema = require('./assets/element.object.field.schema.json');

const opts = { payload: payload, schema: schema };

const crudsObjectFields = (url, schema, payload) => {
  let object, field;
  return cloud.post(url, payload, schema)
    .then(r => object = r.body)
    .then(r => cloud.get(`${url}/${object.id}/fields`))
    .then(r => cloud.post(`${url}/${object.id}/fields`, fieldPayload, fieldSchema))
    .then(r => field = r.body)
    .then(r => cloud.put(`${url}/${object.id}/fields/${field.id}`, fieldPayload, fieldSchema))
    .then(r => cloud.delete(`${url}/${object.id}`));
};

const genObject = (opts) => {
  const newPayload = payload || {};
  newPayload.createdDateName = (opts.createdDateName || 'created_dt');
  return newPayload;
};

suite.forPlatform('elements/object-fields', opts, (test) => {
  let element, keyUrl, idUrl;
  before(() => cloud.get(`elements/closeio`)
    .then(r => element = r.body)
    .then(r => keyUrl = `elements/${element.key}/objects`)
    .then(r => idUrl = `elements/${element.id}/objects`));

  it('should support CRUD by key', () => crudsObjectFields(keyUrl, schema, genObject({})));
  it('should support CRUD by id', () => crudsObjectFields(idUrl, schema, genObject({})));
});
