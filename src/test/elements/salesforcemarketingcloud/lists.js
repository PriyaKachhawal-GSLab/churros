'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/lists.json`);
const contactPayload = tools.requirePayload(`${__dirname}/assets/subscriber.json`);

suite.forElement('marketing', 'lists', { payload: payload }, (test) => {
  let listId;
  before(() => cloud.post(test.api, payload)
    .then(r => listId = r.body.id));

  test.withOptions({ churros: { updatePayload: { ListName: 'updated churros' } } }).should.supportCruds();
  test.should.supportCeqlSearch('id');
  test.should.supportPagination('id');

  it('should allow CRUDS for /lists/:id/contacts', () => {
    let contactId, updatedPayload = { Status: 'Unsubscribed' };
    return cloud.post(`${test.api}/${listId}/contacts`, contactPayload)
      .then(r => contactId = r.body.ID)
      .then(r => cloud.get(`${test.api}/${listId}/contacts/${contactId}`))
      .then(r => cloud.patch(`${test.api}/${listId}/contacts/${contactId}`, updatedPayload))
      .then(r => cloud.get(`${test.api}/${listId}/contacts`))
      .then(r => expect(r.body.filter(obj => obj.Status === updatedPayload.Status)).to.not.be.empty)
      .then(r => cloud.delete(`${test.api}/${listId}/contacts/${contactId}`));
  });

  it(`should allow cursor paginating for ${test.api}/:id/contacts`, () => {
    let contactId1, contactId2, nextPageToken,
      contactPayload1 = tools.requirePayload(`${__dirname}/assets/subscriber.json`),
      contactPayload2 = tools.requirePayload(`${__dirname}/assets/subscriber.json`);
    return cloud.post(`${test.api}/${listId}/contacts`, contactPayload1)
      .then(r => contactId1 = r.body.ID)
      .then(r => cloud.post(`${test.api}/${listId}/contacts`, contactPayload2))
      .then(r => contactId2 = r.body.ID)
      .then(r => cloud.withOptions({ qs: { pageSize: 1 } }).get(`${test.api}/${listId}/contacts`))
      .then(r => {
        expect(r.body.length).to.equal(1);
        expect(r.body[0].ID).to.equal(contactId1);
        expect(r.response.headers['elements-next-page-token']).to.not.be.null;
        nextPageToken = r.response.headers['elements-next-page-token'];
      })
      .then(r => cloud.withOptions({ qs: { nextPage: nextPageToken } }).get(`${test.api}/${listId}/contacts`))
      .then(r => {
        expect(r.body.length).to.equal(1);
        expect(r.body[0].ID).to.equal(contactId2);
        expect(r.response.headers['elements-next-page-token']).to.not.be.null;
        nextPageToken = r.response.headers['elements-next-page-token'];
      })
      .then(r => cloud.withOptions({ qs: { nextPage: nextPageToken } }).get(`${test.api}/${listId}/contacts`))
      .then(r => expect(r.body.length).to.equal(0))
      .then(r => cloud.delete(`${test.api}/${listId}/contacts/${contactId1}`))
      .then(r => cloud.delete(`${test.api}/${listId}/contacts/${contactId2}`));
  });

  it(`should allow Ceql search for ${test.api}/:id/contacts`, () => {
    let contactId1, contactId2,
      contactPayload1 = tools.requirePayload(`${__dirname}/assets/subscriber.json`),
      contactPayload2 = tools.requirePayload(`${__dirname}/assets/subscriber.json`);
    return cloud.post(`${test.api}/${listId}/contacts`, contactPayload1)
      .then(r => contactId1 = r.body.ID)
      .then(r => cloud.post(`${test.api}/${listId}/contacts`, contactPayload2))
      .then(r => contactId2 = r.body.ID)
      .then(r => cloud.withOptions({ qs: { where: `SubscriberKey = '${contactPayload2.SubscriberKey}'` } }).get(`${test.api}/${listId}/contacts`))
      .then(r => {
        expect(r.body.length).to.equal(1);
        expect(r.body[0].ID).to.equal(contactId2);
      })
      .then(r => cloud.delete(`${test.api}/${listId}/contacts/${contactId1}`))
      .then(r => cloud.delete(`${test.api}/${listId}/contacts/${contactId2}`));
  });

  after(() => cloud.delete(`${test.api}/${listId}`));
});
