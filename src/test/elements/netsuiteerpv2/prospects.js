'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const prospectsCreatePayload = tools.requirePayload(`${__dirname}/assets/prospects-create.json`);
const prospectsUpdatePayload = tools.requirePayload(`${__dirname}/assets/prospects-update.json`);

const options = {
  churros: {
    updatePayload: prospectsUpdatePayload
  }
};

suite.forElement('erp', 'prospects', { payload : prospectsCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});