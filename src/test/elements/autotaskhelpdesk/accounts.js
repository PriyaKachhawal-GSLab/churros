'use strict';

const suite = require('core/suite');
const payload = require('./assets/accounts');

suite.forElement('helpdesk', 'accounts', { payload: payload }, (test) => {
  test.should.supportCrus();
  test.withOptions({ qs: { where: 'accountName=\'churrosTestAccount\'' } }).should.return200OnGet();
  test.should.supportPagination();
  test.should.supportNextPagePagination(1);
 });
