'use strict';
const cloud = require('core/cloud');
const suite = require('core/suite');
const tools = require('core/tools');
const expect = chakram.expect;
const CreatePayload = tools.requirePayload(`${__dirname}/assets/payments-create.json`);
const UpdatePayload = tools.requirePayload(`${__dirname}/assets/payments-update.json`);

const options = {
  churros: {
    updatePayload: UpdatePayload
  }
};

suite.forElement('finance', 'bills', { payload: CreatePayload }, (test) => {
  test.should.supportPagination();
  test.withOptions(options).should.supportCruds();
  test.should.supportCeqlSearchForMultipleRecords('totalAmt');
 
    it.skip('should allow Patch for hubs/finance/payments/{id}/void', () => {
    return cloud.post(test.api,payload)
	  .then(r => cloud.patch(`${test.api}/${r.body.id}/void`))
      .then(r=>{
	     expect(r.body.privateNote).to.contain('Voided');
        });
  });
  
});
