'use strict';

const suite = require('core/suite');
const payload = require('./assets/images');

suite.forElement('general', 'images', { payload: payload }, (test) => {
  test.should.supportCrds();
  test.should.supportPagination();
  test.withOptions({ qs: { 'size': 'mobile', 'type': 'mobile' } }).should.return200OnGet();
});
