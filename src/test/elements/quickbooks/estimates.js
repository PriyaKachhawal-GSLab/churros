'use strict';

const suite = require('core/suite');
const payload = require('./assets/estimates');

suite.forElement('finance', 'estimate', { payload: payload }, (test) => {
  test.should.supportCrds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.return200OnGet();
  test.withOptions({ qs: { where: 'totalAmt = \'1\'', page: 1, pageSize: 1 } }).should.return200OnGet();
});
