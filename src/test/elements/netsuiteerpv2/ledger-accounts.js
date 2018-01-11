'use strict';

const suite = require('core/suite');
const payload = require('./assets/ledger-accounts');

suite.forElement('erp', 'ledger-accounts',{ payload: payload }, (test) => {
  test.should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.return200OnGet();
  test.withOptions({ qs: { where: 'isInactive = \'false\'' } }).should.return200OnGet();
});
