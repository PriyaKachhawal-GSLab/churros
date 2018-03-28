'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const chakram = require('chakram');
const expect = require('chakram').expect;

let payload = tools.requirePayload(`${__dirname}/assets/appointments.json`);

suite.forElement('crm', 'appointments', { payload: payload }, (test) => {
  test.should.supportCruds();
  test
    .withOptions({ qs: { where: 'since=\'2018-03-19T06:30:04.000Z\'' } })
    .withName('should support search by created_date')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.creation_date = '2018-03-19T06:30:04.000Z');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
  test.should.supportPagination();
});
