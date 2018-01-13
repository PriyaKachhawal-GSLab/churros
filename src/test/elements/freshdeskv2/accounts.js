'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const accountsPayload = tools.requirePayload(`${__dirname}/assets/accounts.json`);
const accountsPayloadUpdate = tools.requirePayload(`${__dirname}/assets/accountsUpdate.json`);

suite.forElement('helpdesk', 'accounts', (test) => {
  test.should.supportPagination();

  it('should allow CRUDS for employees', () => {
    let aId;
    return cloud.post(test.api, accountsPayload)
      .then(r => aId = r.body.customer.id)
      .then(r => cloud.get(`${test.api}/${aId}`))
      .then(r => cloud.patch(`${test.api}/${aId}`, accountsPayloadUpdate))
      .then(r => cloud.delete(`${test.api}/${aId}`))
      .then(r => cloud.get(test.api))
      .then(r => expect(r.body.filter(obj => obj.name !== '')).to.not.be.empty);
  });

});
