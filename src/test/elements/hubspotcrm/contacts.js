'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const payload = require('./assets/contacts');
const resources = require('./assets/objects');
const tools = require('core/tools');
const cloud = require('core/cloud');
const moment = require('moment');

var contactsId = 396139;

suite.forElement('crm', 'contacts', { payload: payload }, (test) => {
  test.should.supportNextPagePagination(2);
  test.withName('should allow pagination for all contacts with page and nextPage').withOptions({qs: { all: true }}).should.supportNextPagePagination(2);

  it('should test CRUD for /contacts and GET /contacts/{id}/activities', () => {
    const updatePayload = {
      "properties": {
        "lastName": tools.random()
      }
    };
    let contactId;
    const options = { qs: { pageSize: 1 } };
    return cloud.post(test.api, payload)
      .then(r => contactId = r.body.id)
      .then(r => cloud.get(`${test.api}/${contactId}`))
      .then(r => cloud.get(`${test.api}`))
      .then(r => cloud.get(`${test.api}/${contactId}/activities`))
      .then(r => cloud.withOptions(options).get(`${test.api}/${contactId}/activities`))
      .then(r => options.qs.nextPage = r.response.headers['elements-next-page-token'])
      .then(r => cloud.withOptions(options).get(`${test.api}/${contactId}/activities`))
      .then(r => cloud.patch(`${test.api}/${contactId}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${contactId}`));
  });

  it('should test contacts poller url', () => {
    let id;
    let objects;
    const createPayload = {
      "properties": {
        "firstName": tools.random(),
        "lastName": tools.random(),
        "email": tools.random() + "-churros@delete.me"
      }
    };
    const options = { qs: { where: "lastmodifieddate='" + moment().subtract(5, 'seconds').format() + "'" } };
    const checkLength = (objects) => {
      return (objects.length > 0);
    };
    const checkId = (postedId, polledId) => {
      return (postedId === polledId);
    };
    return cloud.post(test.api, createPayload)
      .then(r => id = r.body.id)
      .then(r => tools.sleep(10))
      .then(r => cloud.withOptions(options).get(test.api))
      .then(r => objects = r.body)
      .then(r => checkLength(objects))
      .then(r => expect(r).to.be.true)
      .then(r => checkId(id, objects[0].id))
      .then(r => expect(r).to.be.true)
      .then(r => expect(objects[0].properties).to.contain.key('lastmodifieddate') && expect(objects[0].properties).to.contain.key('createdate'))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });

  it('should test get for xformed contact', () => {
    let id;
    const email = tools.random() + "-churros@delete.me";
    const createPayload = {
      "properties": {
        "firstName": tools.random(),
        "lastName": tools.random(),
        "email": email
      }
    };
    return cloud.post('/organizations/objects/churrosTestObject/definitions', resources.churrosTestObject, () => {})
      .then(r => cloud.post('/organizations/elements/hubspotcrm/transformations/churrosTestObject', resources.churrosTestObjectXform, () => {}))
      .then(r => cloud.post(test.api, createPayload))
      .then(r => id = r.body.id)
      .then(r => cloud.get('/hubs/crm/churrosTestObject/' + id))
      .then(r => expect(r.body).to.contain.key('email') && expect(r.body).to.contain.key('id') && expect(r.body).to.contain.key('name'))
      .then(r => cloud.delete(`${test.api}/${id}`))
      .then(r => cloud.delete('/organizations/elements/hubspotcrm/transformations/churrosTestObject'))
      .then(r => cloud.delete('/organizations/objects/churrosTestObject/definitions'));
  });
  test.should.supportNextPagePagination(1);
});
suite.forElement('crm', `contacts/${contactsId}/activities`, { payload: payload }, (test) => {
  test.should.supportPagination();
});
