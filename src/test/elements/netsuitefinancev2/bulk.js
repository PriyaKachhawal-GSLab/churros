'use strict';

const suite = require('core/suite');

suite.forElement('finance', 'bulk', (test) => {
  let opts = {json: true, csv: true};
  test.withName('should support bulk download with limit').should.supportBulkDownload({ qs: { q: 'select * from customers limit 100' } }, opts, 'customers');
  opts.timeout = 120000;
  test.withName('should support bulk download with transformed fields').should.supportBulkDownload({ qs: { q: 'select * from bulkCustomerNfv2 limit 200' } }, opts, 'bulkCustomerNfv2');
});
