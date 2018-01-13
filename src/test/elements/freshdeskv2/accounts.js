'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const accountsPayload = tools.requirePayload(`${__dirname}/assets/accounts.json`);
const accountsPayloadUpdate = tools.requirePayload(`${__dirname}/assets/accountsUpdate.json`);

suite.forElement('helpdesk', 'accounts', (test) => {
  test.should.supportPagination();

  test.withApi(test.api)
    .withOptions({ qs: { where: "letter='cb'" } })
    .withValidation(r => expect(r.body[0].customer.name === 'cb').to.not.be.empty)
    .withName('should allow GET with option letter')
    .should.return200OnGet();

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
