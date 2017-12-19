'use strict';
const suite = require('core/suite');
const cloud = require('core/cloud');
const payload = require('./assets/candidates');
const updatePayload = {
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
      .then(r => cloud.patch(`${test.api}/${candidateId}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${candidateId}`));
  });
});
