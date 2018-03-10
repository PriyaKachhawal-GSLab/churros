'use strict';
const suite = require('core/suite');

suite.forElement('erp', 'invoices-totals', (test) => {
  test.should.supportS();
  test.withOptions({ qs: { where: `type = 'draft' ` } }).withName('should support Ceql type search')
    .should.return200OnGet();
  test.withOptions({ qs: { where: `type = 'booked' ` } }).withName('should support Ceql type search')
    .should.return200OnGet();
  test.withOptions({ qs: { where: `type = 'booked' and subType = 'paid' ` } }).withName('should support Ceql type and sub-type search')
    .should.return200OnGet();
  test.withOptions({ qs: { where: `type = 'booked' and subType = 'unpaid' ` } }).withName('should support Ceql type and sub-type search')
    .should.return200OnGet();
  test.withOptions({ qs: { where: `type = 'booked' and subType = 'unpaid' and due = 'overdue' ` } }).withName('should support Ceql type,due and sub-type search')
    .should.return200OnGet();
  test.withOptions({ qs: { where: `type = 'booked' and subType = 'unpaid' and due = 'not-overdue' ` } }).withName('should support Ceql type,due and sub-type search')
    .should.return200OnGet();
});
