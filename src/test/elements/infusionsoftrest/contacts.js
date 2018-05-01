'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const cloud = require('core/cloud');

let payload = tools.requirePayload(`${__dirname}/assets/contacts.json`);
let emailPayload = tools.requirePayload(`${__dirname}/assets/contactEmail.json`);
let tagPayload = tools.requirePayload(`${__dirname}/assets/postContactTag.json`);

suite.forElement('crm', 'contacts', { payload: payload },(test) => {
  test.should.supportCruds();
  test.should.supportPagination();
  test
    .withOptions({ qs: { where: 'family_name=\'String\'' } })
    .withName('should support search by created_date')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.family_name = 'String');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();

it.skip('should support CS for /contacts/id/tags', () => {
    let contactId;
    let tagId = 93;

    return cloud.get(test.api)
      .then(r => {
        contactId = r.body[0].id;
      })
      .then(r => cloud.post(`${test.api}/${contactId}/tags`, tagPayload))
      .then(r => cloud.get(`${test.api}/${contactId}/tags`))
      .then(r => cloud.withOptions({ qs: { pageSize: 1, page: 1 } }).get(`${test.api}/${contactId}/tags`))
      .then(r => cloud.delete(`${test.api}/${contactId}/tags/${tagId}`));
  });

it.skip('should support CS for /contacts/id/emails', () => {
    let contactId;

    return cloud.get(test.api)
      .then(r => {
        contactId = r.body[0].id;
      })
      .then(r => cloud.post(`${test.api}/${contactId}/emails`, emailPayload))
      .then(r => cloud.get(`${test.api}/${contactId}/emails`))
      .then(r => cloud.withOptions({ qs: { pageSize: 1, page: 1 } }).get(`${test.api}/${contactId}/emails`));
  });
});