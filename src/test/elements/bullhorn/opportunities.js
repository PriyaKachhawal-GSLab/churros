'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const payload = require('./assets/opportunities');

const updatePayload = {
  "type": "contract"
};

suite.forElement('crm', 'opportunities', { payload: payload }, (test) => {
  it('should support CRUDS for opportunities', () => {
    let opportunityId;
    return cloud.post(test.api, payload)
      .then(r => opportunityId = r.body.changedEntityId)
      .then(r => cloud.get(`${test.api}/${opportunityId}`))
      .then(r => cloud.withOptions({ qs: { fields: 'id,clientCorporation.name' } })
        .get(`${test.api}/${opportunityId}`)
        .then(r => {
          expect(r.body).to.contain.key('id');
          expect(r.body).to.contain.key('clientCorporation');
          expect(r.body.clientCorporation).to.contain.key('name');
        }))
      .then(r => cloud.patch(`${test.api}/${opportunityId}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${opportunityId}`));
  });
});
