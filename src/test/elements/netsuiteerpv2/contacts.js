'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/contacts.json`);

suite.forElement('erp', 'contacts', { payload: payload }, (test) => {
  test.should.supportCrus();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.return200OnGet();
  //test.should.supportCeqlSearch('id');
});
