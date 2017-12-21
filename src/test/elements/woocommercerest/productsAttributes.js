'use strict';

const suite = require('core/suite');
const payload = require('core/tools').requirePayload(`${__dirname}/assets/productsAttributes.json`);

suite.forElement('ecommerce', 'products-attributes', { payload: payload }, (test) => {
  test.should.supportCruds();
  // unique is "id"
  test.withOptions({qs:{pageSize: 5, page: 1}}).should.supportPagination('id');
});
