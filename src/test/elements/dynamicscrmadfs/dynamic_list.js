'use strict';

const suite = require('core/suite');

suite.forElement('crm', 'contacts', { }, (test) => {
  test.withOptions({ qs: { where : `listid = '8cc802ca-6154-e811-812e-e0071b715b91'` } }).should.supportPagination();
});
