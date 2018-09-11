'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const locationsCreatePayload = tools.requirePayload(`${__dirname}/assets/locations-create.json`);
const locationsUpdatePayload = tools.requirePayload(`${__dirname}/assets/locations-update.json`);

const options = {
  churros: {
    updatePayload: locationsUpdatePayload
  }
};

suite.forElement('erp', 'locations', { payload : locationsCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});