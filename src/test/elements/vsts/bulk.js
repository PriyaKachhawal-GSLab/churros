'use strict';

const suite = require('core/suite');

suite.forElement('collaboration', 'bulk', (test) => {
  let opts = { json: true, csv: true, timeout: 120000 };
  test.withName('should support bulk download for workItems').should.supportBulkDownloadBasic({ qs: { q: 'select * from workItems' } }, opts, 'workItems');
  test.withName('should support bulk download with limit for workItems').should.supportBulkDownload({ qs: { q: 'select * from workItems limit 100' } }, opts, 'workItems');
});
