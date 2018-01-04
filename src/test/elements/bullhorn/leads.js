'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const payload = require('./assets/leads');
const updatePayload = {
  "email": "test@gamil.com"
};
suite.forElement('crm', 'leads', { payload: payload }, (test) => {
  it('should support CRUDS for leads', () => {
    let leadId;
    return cloud.post(test.api, payload)
      .then(r => leadId = r.body.changedEntityId)
      .then(r => cloud.get(`${test.api}/${leadId}`))
      .then(r => cloud.withOptions({ qs: { fields: 'id,secondaryAddress.countryCode' } }).get(`${test.api}/${leadId}`))
      .then(r => cloud.patch(`${test.api}/${leadId}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${leadId}`));
  });
});
