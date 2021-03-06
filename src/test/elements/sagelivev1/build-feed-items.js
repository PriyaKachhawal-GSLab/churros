'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/build-feed-items.json`);

suite.forElement('finance', 'build-feed-items', { payload: payload, skip: true }, (test) => {
  let number = "0051Y00" + Math.random(10).toPrecision(3).replace("\.", "") + "d9mDQAQ";
  payload.SetupOwnerId = number;
  test.should.supportCruds();
  test.should.supportPagination();
  test
    .withName(`should support searching ${test.api} by Name`)
    .withOptions({ qs: { where: `Name  ='Test'` } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.Name === `Test`);
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
});
