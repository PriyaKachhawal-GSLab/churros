'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const leadsPayload = tools.requirePayload(`${__dirname}/assets/leads-create.json`);
const updatePayload = tools.requirePayload(`${__dirname}/assets/leads-update.json`);

suite.forElement('marketing', 'leads', { payload: leadsPayload }, (test) => {
  const options = {
    churros: {
      updatePayload: updatePayload
    }
  };
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination();
  test.should.supportCeqlSearch('id');
});
