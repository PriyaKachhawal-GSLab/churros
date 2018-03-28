'use strict';
const suite = require('core/suite');
const expect = require('chakram').expect;

suite.forElement('erp', 'invoices-totals', (test) => {
  test.should.supportS();

  test.withOptions({ qs: { where: `type = 'draft' ` } }).withName('should support Ceql type search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.self === 'https://restapi.e-conomic.com/invoices/totals/drafts');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();

  test.withOptions({ qs: { where: `type = 'booked' ` } }).withName('should support Ceql type search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.self === 'https://restapi.e-conomic.com/invoices/totals/booked');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();

  test.withOptions({ qs: { where: `type = 'booked' and subType = 'paid' ` } }).withName('should support Ceql type and sub-type search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.self === 'https://restapi.e-conomic.com/invoices/totals/booked/paid');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();

  test.withOptions({ qs: { where: `type = 'booked' and subType = 'unpaid' ` } }).withName('should support Ceql type and sub-type search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.self === 'https://restapi.e-conomic.com/invoices/totals/booked/unpaid');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();

  test.withOptions({ qs: { where: `type = 'booked' and subType = 'unpaid' and due = 'overdue' ` } }).withName('should support Ceql type,due and sub-type search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.self === 'https://restapi.e-conomic.com/invoices/totals/booked/unpaid/overdue');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();

  test.withOptions({ qs: { where: `type = 'booked' and subType = 'unpaid' and due = 'not-overdue' ` } }).withName('should support Ceql type,due and sub-type search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.self === 'https://restapi.e-conomic.com/invoices/totals/booked/unpaid/not-overdue');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
});
