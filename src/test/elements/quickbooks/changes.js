'use strict';

const suite = require('core/suite');

suite.forElement('finance', 'changes', null, (test) => {
  test.withOptions({ qs: { where: 'changedSince=\'2015-12-23T10:00:00-07:00\'', entities: 'products,bills' } })
  .should.return200OnGet();
});
