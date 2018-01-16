'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const common = require('./assets/common.js');
const schema = require('./assets/element.resource.schema.json');
const listSchema = require('./assets/element.resources.schema.json');
const resourcePayload = require('./assets/element.resource.payload.json');
const expect = require('chakram').expect;

const opts = { payload: common.genResource({}), schema: schema };


suite.forPlatform('elements/resources', opts, (test) => {
  let element, keyUrl, idUrl;
  before(() => common.deleteElementByKey('churros')
    .then(r => cloud.post('elements', common.genElement({})))
    .then(r => element = r.body)
    .then(r => keyUrl = `elements/${element.key}/resources`)
    .then(r => idUrl = `elements/${element.id}/resources`));

  it('should support CRUD by key', () => common.crudsResource(keyUrl, schema, listSchema, common.genResource({}), common.genResource({ description: "An updated Churros resource" })));
  it('should support CRUD by ID', () => common.crudsResource(idUrl, schema, listSchema, common.genResource({}), common.genResource({ description: "An updated Churros resource" })));

  it('should support CRUD by key with objects', () => common.crudsResource(keyUrl, schema, listSchema, resourcePayload, resourcePayload));
  it('should support CRUD by ID  with objects', () => common.crudsResource(idUrl, schema, listSchema, resourcePayload, resourcePayload));

  it('should support CRUD by key with sample data and other optional fields', () => common.crudsResource(keyUrl, schema, listSchema, common.genResource({}), common.genResource({ description: "An updated Churros resource", response: { sampleData: "{\"key\": \"value\"}"}, operationId: "getChurrosById" })));
  it('should support CRUD by ID with sample data and other optional fields', () => common.crudsResource(idUrl, schema, listSchema, common.genResource({}), common.genResource({ description: "An updated Churros resource", response: { sampleData :"{\"key\": \"value\"}"}, operationId: "getChurrosByKey" })));

  it('should return resources associated with an object', () =>{
    let objectId;
    return cloud.post(`elements/${element.id}/resources`, resourcePayload)
    .then(r => objectId = r.body.object.id)
    .then(r => cloud.withOptions({qs: {hydrate: true}}).get(`elements/${element.id}/objects/${objectId}`))
    .then(r => expect(r.body.resources).to.have.length(1));
  });

  after(() => cloud.delete(`elements/${element.key}`));
});
