'use strict';

const suite = require('core/suite');
const invoicesschema = require('./assets/invoices.json');

suite.forElement('payment', 'invoices', (test) => {
  test.should.supportSr();
  test.withValidation(invoicesschema).withName('should support Ceql search').withOptions({ qs: { where: 'status=\'unpaid\'' } }).should.return200OnGet();
  test.should.supportPagination();
});
