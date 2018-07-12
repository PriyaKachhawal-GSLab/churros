'use strict';

const suite = require('core/suite');
const payload = require('core/tools').requirePayload(`${__dirname}/assets/accounts.json`);


suite.forElement('erp', 'accounts', { payload: payload}, (test) => {
  test.should.supportCrus();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.return200OnGet();
  //test.should.supportCeqlSearch('id');
});
