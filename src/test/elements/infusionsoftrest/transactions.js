'use strict';

const suite = require('core/suite');
const chakram = require('chakram');
const expect = require('chakram').expect;

suite.forElement('crm', 'transactions', (test) => {
  test.should.supportSr();
  test.should.supportPagination();
  test
    .withOptions({ qs: { where: 'since=\'2018-03-22T07:09:53.000Z\'' } })
    .withName('should support search by created_date')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.creation_date = '2018-03-22T07:09:53.000Z');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
});