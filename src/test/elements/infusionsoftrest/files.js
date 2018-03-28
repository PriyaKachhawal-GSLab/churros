'use strict';

const suite = require('core/suite');
const chakram = require('chakram');
const expect = require('chakram').expect;
const cloud = require('core/cloud');

suite.forElement('crm', 'files', (test) => {
  test.should.supportSr();
  test.should.supportPagination();
  test
    .withOptions({ qs: { where: 'permission = \'USER\'' } })
    .withName('should support search by permission')
    .withValidation(r => {
      expect(r).to.statusCode(200);
    })
    .should.return200OnGet();
});