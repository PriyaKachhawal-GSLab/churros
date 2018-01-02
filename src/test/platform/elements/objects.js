'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const schema = require('./assets/element.object.schema.json');
const payload = require('core/tools').requirePayload(`${__dirname}/assets/element.object.payload.json`);

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

suite.forPlatform('elements/objects', opts, (test) => {
  let element, keyUrl, idUrl;
  before(() => cloud.get(`elements/closeio`)
    .then(r => element = r.body)
    .then(r => keyUrl = `elements/${element.key}/objects`)
    .then(r => idUrl = `elements/${element.id}/objects`));

  it('should support CRUD by key', () => crudsObject(keyUrl, schema, genObject({}), genObject({ createdDateName: "created_date" })));
  it('should support CRUD by id', () => crudsObject(idUrl, schema, genObject({}), genObject({ createdDateName: "created_date" })));
});
