'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const campaignsCreatePayload = tools.requirePayload(`${__dirname}/assets/campaigns-create.json`);
const campaignsUpdatePayload = tools.requirePayload(`${__dirname}/assets/campaigns-update.json`);

const options = {
  churros: {
    updatePayload: campaignsUpdatePayload
  }
};

suite.forElement('erp', 'campaigns', { payload : campaignsCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});