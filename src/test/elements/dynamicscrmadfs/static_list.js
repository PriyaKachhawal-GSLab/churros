'use strict';

const suite = require('core/suite');

suite.forElement('crm', 'contacts', { }, (test) => {
  test.withOptions({ qs: { where : `listid = 'c6d384d2-5749-e811-8120-e0071b66cf61'` } }).should.supportPagination();
});
