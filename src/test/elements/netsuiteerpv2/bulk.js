'use strict';

const suite = require('core/suite');

suite.forElement('erp', 'bulk', null, (test) => {
  const opts = {csv: true, json: false, timeout: 90000};
  test.should.supportBulkDownload({ qs: { q: 'select * from employee' } }, opts, 'employee');
  test.should.supportBulkDownload({ qs: { q: 'select lastName,isSupportRep,title from employee' } }, opts, 'employee');
});
