'use strict';

const suite = require('core/suite');

suite.forElement('crm', 'affiliates/commissions', (test) => {
  test.should.supportS();
  test.should.supportPagination();
});
