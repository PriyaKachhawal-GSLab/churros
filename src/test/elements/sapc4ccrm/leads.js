'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const leadsCreatePayload = tools.requirePayload(`${__dirname}/assets/leads-create.json`);
const leadsUpdatePayload = tools.requirePayload(`${__dirname}/assets/leads-update.json`);

const options = {
  churros: {
    updatePayload: leadsUpdatePayload
  }
};

suite.forElement('crm', 'leads', { payload : leadsCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});