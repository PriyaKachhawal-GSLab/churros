'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/contact.json`);
const specialCharPayload = tools.requirePayload(`${__dirname}/assets/specialCharContact.json`);

suite.forElement('helpdesk', 'contacts', {payload:payload}, (test) => {
  after(() => Promise.all([
    cloud.delete(`${test.api}/${payload.name}`).catch(() => {}),
    cloud.delete(`${test.api}/${specialCharPayload.name}`).catch(() => {})
  ]));
  it(`should allow CRUDS for ${test.api} with Ceql search`, () => {
    let contactId;
    return cloud.post(test.api, payload)
      .then(r => contactId = r.body.key)
      .then(r => cloud.get(`${test.api}/${contactId}`))
      .then(r => cloud.withOptions({ qs: { where: `username='${payload.displayName}'`}}).get(test.api))
      .then(r => expect(r.body.length).to.be.equal(1))
      .then(r => cloud.delete(`${test.api}/${contactId}`));
   });

   it(`should allow CRUDS for ${test.api} with special characters & Ceql search`, () => {
     let contactId;
     return cloud.post(test.api, specialCharPayload)
       .then(r => contactId = r.body.key)
       .then(r => cloud.withOptions({ qs: { where: `username='${specialCharPayload.displayName}'`}}).get(test.api))
       .then(r => expect(r.body.length).to.be.equal(1))
       .then(r => cloud.delete(`${test.api}/${contactId}`));
    });

    test.withOptions({ qs: { where: `username='test'` }}).should.supportPagination();
 });
