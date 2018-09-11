'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const billingAccountsCreatePayload = tools.requirePayload(`${__dirname}/assets/billing-accounts-create.json`);
const billingAccountsUpdatePayload = tools.requirePayload(`${__dirname}/assets/billing-accounts-update.json`);

const options = {
  churros: {
    updatePayload: billingAccountsUpdatePayload
  }
};

// Due to permission issues we are unable to test this api ... getting The 'Billing Accounts feature is not enabled in your NetSuite account.
suite.forElement('erp', 'billing-accounts', { payload : billingAccountsCreatePayload, skip : true }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});