'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const transferOrdersCreatePayload = tools.requirePayload(`${__dirname}/assets/transfer-orders-create.json`);
const transferOrdersUpdatePayload = tools.requirePayload(`${__dirname}/assets/transfer-orders-update.json`);

const options = {
  churros: {
    updatePayload: transferOrdersUpdatePayload
  }
};

suite.forElement('erp', 'transfer-orders', { payload : transferOrdersCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});