'use strict';

const suite = require('core/suite');

suite.forElement('marketing', 'bulk', (test) => {
  let opts = {json: true, csv: true};
  opts.timeout = 120000;
  test.withName('should support bulk download with limit for leads').should.supportBulkDownloadBasic({ qs: { q: 'select * from leads limit 100' } }, opts, 'leads');
  test.withName('should support bulk download with limit for channels').should.supportBulkDownloadBasic({ qs: { q: 'select * from channels limit 100' } }, opts, 'channels');
  test.withName('should support bulk download with limit for activities').should.supportBulkDownloadBasic({ qs: { q: 'select * from activities where activityTypeIds in (1,12) limit 100',fromDate : '2014-09-22' } }, opts, 'activities');
  test.withName('should support bulk download with limit for lists').should.supportBulkDownloadBasic({ qs: { q: 'select * from lists limit 100' } }, opts, 'lists');
});
