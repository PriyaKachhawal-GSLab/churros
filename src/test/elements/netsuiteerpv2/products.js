'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const productsCreatePayload = tools.requirePayload(`${__dirname}/assets/products-create.json`);
const productsUpdatePayload = tools.requirePayload(`${__dirname}/assets/products-update.json`);

const options = {
  churros: {
    updatePayload: productsUpdatePayload
  }
};

suite.forElement('erp', 'products', { payload : productsCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});