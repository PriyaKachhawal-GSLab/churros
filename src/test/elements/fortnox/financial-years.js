'use strict';

const suite = require('core/suite');

suite.forElement('erp', 'financial-years', (test) => {
  test.withApi(`${test.api}`)
    .withName('should allow GET financial years')
    .should.return200OnGet();
  test.withApi(`${test.api}`)
    .withOptions({ qs: { where: 'date = \'2014-01-01\'' } })
    .withName('should allow GET financial years by date')
    .should.return200OnGet();

  test.should.supportPagination();
});