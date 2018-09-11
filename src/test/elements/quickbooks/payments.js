'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const CreatePayload = tools.requirePayload(`${__dirname}/assets/bills-create.json`);
const UpdatePayload = tools.requirePayload(`${__dirname}/assets/bills-update.json`);

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
