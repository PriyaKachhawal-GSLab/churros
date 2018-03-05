'use strict';
const suite = require('core/suite');
const cloud = require('core/cloud');
const payload = require('./assets/contacts');
const expect = require('chakram').expect;

const updatePayload = {
  "name": "John Snow",
  "firstName": "John",
  "lastName": "Snow"
};

suite.forElement('crm', 'contacts', { payload: payload }, (test) => {
  it('should support CRUDS for contacts', () => {
    let contactId;
    return cloud.post(test.api, payload)
      .then(r => contactId = r.body.changedEntityId)
      .then(r => cloud.get(test.api))
      .then(r => cloud.get(`${test.api}/${contactId}`))
      .then(r => cloud.withOptions({ qs: { fields: 'id  ,secondaryAddress.countryCode' } })
      .get(`${test.api}/${contactId}`)
      .then(r => {
      expect(r.body).to.contain.key('id');
      expect(r.body).to.contain.key('secondaryAddress');
      expect(r.body.secondaryAddress).to.contain.key('countryCode');
      }))      .then(r => cloud.patch(`${test.api}/${contactId}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${contactId}`));
  });
});
