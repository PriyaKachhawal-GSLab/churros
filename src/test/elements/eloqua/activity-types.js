'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('marketing', 'activity-types', null, (test) => {
  test.should.return200OnGet();
});