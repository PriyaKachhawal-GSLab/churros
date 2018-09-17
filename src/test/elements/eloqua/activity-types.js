'use strict';

const suite = require('core/suite');

suite.forElement('marketing', 'activity-types', null, (test) => {
  test.should.return200OnGet();
});