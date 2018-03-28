'use strict';

const suite = require('core/suite');
const chakram = require('chakram');
const expect = require('chakram').expect;
const cloud = require('core/cloud');
const tools = require('core/tools');

const tagPayload = tools.requirePayload(`${__dirname}/assets/tags.json`);
const categoryPayload = tools.requirePayload(`${__dirname}/assets/category.json`);
const contactPayload = tools.requirePayload(`${__dirname}/assets/contacts.json`);

suite.forElement('crm', 'tags', { payload: tagPayload, skip: true }, (test) => {
  test.should.supportCrs();
  test.should.supportPagination();

  it.skip('should support C for /tags/categories', () => {
    let orderId;
    return cloud.post('/tags/categories', categoryPayload)
  });

  it('should support CRD /tags/{id}/contacts', () => {
    let contactId;
    let tagId = 91;
    let payload = {};
    let id = [];
    return cloud.post('/contacts', contactPayload)
    .then(r => {
        contactId = r.body.id;
        id.push(contactId);
        payload.ids = id;
      })
      .then(r => cloud.get(`${test.api}/${tagId}/contacts`))
      .then(r => cloud.post(`${test.api}/${tagId}/contacts`, payload))
      .then(r => cloud.withOptions({ qs: { pageSize: 1, page: 1 } }).get(test.api))
      .then(r => cloud.delete(`${test.api}/${tagId}/contacts/${contactId}`))
      .then(r => cloud.delete(`/contacts/${contactId}`));
  });
});