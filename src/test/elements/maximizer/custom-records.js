'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const tools = require('core/tools');
const faker = require('faker');

const customrecordPayload = tools.requirePayload(`${__dirname}/assets/customrecords.json`);

suite.forElement('crm', 'custom-records', (test) => {

  test.should.supportPagination();

  it('should allow CRUDS for /custom-records', () => {
    let customrecordId;
    return cloud.get(test.api)
      .then(r => customrecordPayload.ApplicationId = r.body[0].ApplicationId)
      .then(() => cloud.post(test.api, customrecordPayload))
      .then(r => {
        customrecordId = r.body.Key;
        expect(r.body.Name).to.equal(customrecordPayload.Name);
      })
      .then(() => cloud.withOptions({ qs: { where: `Name='${customrecordPayload.Name}'` } }).get(test.api))
      .then(r => expect(r.body[0].Name).to.equal(customrecordPayload.Name))
      .then(() => cloud.withOptions({ qs: { fields:`Description,Name` } }).get(test.api))
      .then(r => expect(Object.keys(r.body[0]).length).to.equal(2))
      .then(() => cloud.get(`${test.api}/${customrecordId}`))
      .then(() => cloud.withOptions({ qs: { fields:`Description,Name` } }).get(`${test.api}/${customrecordId}`))
      .then(r => expect(Object.keys(r.body).length).to.equal(2))
      .then(() => customrecordPayload.Name = faker.name.findName())
      .then(() => cloud.patch(`${test.api}/${customrecordId}`, customrecordPayload))
      .then(r => expect(r.body.Name).to.equal(customrecordPayload.Name))
      .then(() => cloud.delete(`${test.api}/${customrecordId}`))
      .catch(e => {
        if (customrecordId) cloud.delete(`${test.api}/${customrecordId}`);
        throw new Error(e);
      });

  });
});
