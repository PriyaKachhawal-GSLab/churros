'use strict';

const suite = require('core/suite');
const payload = require('./assets/customer-refunds');

suite.forElement('erp', 'customer-refunds', { payload: payload }, (test) => {
  const options = {
    churros: {
      updatePayload: {
        "ccApproved": false
      }
    }
  };
  test.withOptions(options).should.supportCrus();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.return200OnGet();
  test.withOptions({ qs: { where: 'lastModifiedDate >= \'2016-08-05T09:35:38Z\'' } }).should.return200OnGet();
});
