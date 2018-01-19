'use strict';

const suite = require('core/suite');
const schema = require('./assets/schema.json');

suite.forElement('finance', 'reporting-periods', null , (test) => {
  test.should.return200OnGet();
  test.should.supportPagination();
  test.withValidation(schema).withName('should support status = {string} Ceql search')
  .withOptions({ qs: { where: 'status=\'active\'' } }).should.return200OnGet();
});
