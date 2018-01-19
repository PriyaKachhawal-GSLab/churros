'use strict';
const suite = require('core/suite');
const cloud = require('core/cloud');
const payload = require('./assets/candidates');
const expect = require('chakram').expect;const updatePayload = {
  "name": "John Snow",
  "firstName": "John",
  "lastName": "Snow"
};
suite.forElement('crm', 'candidates', { payload: payload }, (test) => {
  it('should support CRUDS for candidates', () => {
    let candidateId;
    return cloud.post(test.api, payload)
      .then(r => candidateId = r.body.changedEntityId)
      .then(r => cloud.get(test.api))
      .then(r => cloud.get(`${test.api}/${candidateId}`))
      .then(r => cloud.withOptions({ qs: { fields: 'id,address.countryCode,secondaryAddress.countryCode' } })
        .get(`${test.api}/${candidateId}`)
        .then(r => {
          expect(r.body).to.contain.key('id');
          expect(r.body).to.contain.key('address');
          expect(r.body.address).to.contain.key('countryCode');
          expect(r.body).to.contain.key('secondaryAddress');
          expect(r.body.secondaryAddress).to.contain.key('countryCode');
        }))
      .then(r => cloud.patch(`${test.api}/${candidateId}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${candidateId}`));
  });
});
