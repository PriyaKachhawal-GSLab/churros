'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;

let createPayload = tools.requirePayload(`${__dirname}/assets/createDefect.json`);


suite.forElement('general', 'defects', { payload: createPayload }, (test) => {
  test.should.supportCruds();
  test.should.supportPagination();
  test
    .withOptions({ qs: { where: 'ScheduleState = \'Completed\'' } })
    .withName('should support search by filter')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.ScheduleState = 'Completed');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
});
