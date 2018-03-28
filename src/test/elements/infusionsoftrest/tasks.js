'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const chakram = require('chakram');
const expect = require('chakram').expect;

let payload = tools.requirePayload(`${__dirname}/assets/tasks.json`);

suite.forElement('crm', 'tasks', { payload: payload }, (test) => {
  test.should.supportCruds();
  test
    .withOptions({ qs: { where: 'since=\'2018-03-20T08:55:10.000Z\'' } })
    .withName('should support search by created_date')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.creation_date = '2018-03-20T08:55:10.000Z');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
  test.should.supportPagination();
});

suite.forElement('crm', 'tasks/search', (test) => {
  test.should.supportS();
  test
    .withOptions({ qs: { where: 'since=\'2018-03-20T08:55:10.000Z\'' } })
    .withName('should support search by created_date')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.creation_date = '2018-03-20T08:55:10.000Z');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
  test.should.supportPagination();
});

