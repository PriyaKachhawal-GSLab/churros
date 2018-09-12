'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const casesCreatePayload = tools.requirePayload(`${__dirname}/assets/cases-create.json`);
const casesUpdatePayload = tools.requirePayload(`${__dirname}/assets/cases-update.json`);

const options = {
  churros: {
    updatePayload: casesUpdatePayload
  }
};

suite.forElement('crm', 'cases', { payload : casesCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});