'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const serviceResaleItemsCreatePayload = tools.requirePayload(`${__dirname}/assets/service-resale-items-create.json`);
const serviceResaleItemsUpdatePayload = tools.requirePayload(`${__dirname}/assets/service-resale-items-update.json`);

const options = {
  churros: {
    updatePayload: serviceResaleItemsUpdatePayload
  }
};

suite.forElement('erp', 'service-resale-items', { payload : serviceResaleItemsCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});