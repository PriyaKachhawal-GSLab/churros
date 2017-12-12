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
      .then(() => cloud.get(`${test.api}/${customrecordId}`))
      .then(() => customrecordPayload.Name = faker.random.word())
      .then(() => cloud.patch(`${test.api}/${customrecordId}`, customrecordPayload))
      .then(r => expect(r.body.Name).to.equal(customrecordPayload.Name))
      .then(() => cloud.delete(`${test.api}/${customrecordId}`));
  });
});
