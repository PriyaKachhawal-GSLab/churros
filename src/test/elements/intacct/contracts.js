'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const contractsCreatePayload = tools.requirePayload(`${__dirname}/assets/contracts-create.json`);
const contractsUpdatePayload = tools.requirePayload(`${__dirname}/assets/contracts-update.json`);

const options = {
  churros: {
    updatePayload: contractsUpdatePayload
  }
};

suite.forElement('finance', 'contracts', { payload: contractsCreatePayload, skip : true }, (test) => {
  //for this resorces we need some specail permissions and account we are using in churros does not have that permissions hence APIs are failing for permission issue.
  test.should.supportNextPagePagination(2);
  test.withOptions(options).should.supportCruds();
});
