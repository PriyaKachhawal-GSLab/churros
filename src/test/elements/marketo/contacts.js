'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/contacts-create.json`);
const contactToMergePayload = tools.requirePayload(`${__dirname}/assets/contacts-create.json`);
const contactsMergePayload = tools.requirePayload(`${__dirname}/assets/contactsMerge-create.json`);
const updatedPayload = tools.requirePayload(`${__dirname}/assets/contacts-update.json`);
const interactionPayload = tools.requirePayload(`${__dirname}/assets/contactsInteractions-create.json`);
const queryType = tools.requirePayload(`${__dirname}/assets/changed-contacts-requiredQueryParam-s.json`);
const queryContactsPayload = tools.requirePayload(`${__dirname}/assets/contacts-requiredQueryParam-s.json`);
const queryDeletedContactsPayload = tools.requirePayload(`${__dirname}/assets/deleted-contacts-requiredQueryParam-s.json`);

suite.forElement('marketing', 'contacts', { payload: payload }, (test) => {
  it('should allow CRUDS for /contacts', () => {
    let id;
    return cloud.post(test.api, payload)
      .then(r => id = r.body.person.id)
      .then(r => queryContactsPayload.where = `id in ( ${id} )`)
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => cloud.patch(`${test.api}/${id}`, updatedPayload))
      .then(r => cloud.withOptions({ qs: queryContactsPayload }).get(test.api))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
  it('should allow POST /contacts/:id/merge and POST /contacts/:id/interactions', () => {
    let id, id2;
    return cloud.post(test.api, payload)
      .then(r => id = r.body.person.id)
      .then(r => cloud.post(`${test.api}/${id}/interactions`, interactionPayload))
      .then(r => cloud.post(test.api, contactToMergePayload))
      .then(r => id2 = r.body.person.id)
      .then(r => contactsMergePayload.leadIds.push(id2))
      .then(r => cloud.post(`${test.api}/${id}/merge`, contactsMergePayload))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
  test
    .withApi('/changed-contacts')
    .withName('should support sinceDate query on GET /changed-contacts')
    .withOptions({ qs: queryType })
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.activityDate >= '2016-11-25T11:39:58Z');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();

  test
    .withApi('/deleted-contacts')
    .withName('should support sinceDate query on GET /deleted-contacts')
    .withOptions({ qs: queryDeletedContactsPayload })
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.activityDate >= '2016-11-25T11:39:58Z');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
});
