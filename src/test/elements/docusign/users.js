'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/users.json`);
const chakram = require('chakram');
const expect = chakram.expect;

suite.forElement('esignature', 'users', { payload: payload }, (test) => {
  const options = {
    churros: {
      updatePayload: {
        "name": tools.random()
      }
    }
  };

  test.withOptions(options).should.supportCruds(chakram.put);
  test.should.supportPagination();
  test.should.supportCeqlSearch('email');
  test.withName(`should support searching ${test.api} by email`)
    .withOptions({ qs: { where: `email ='test@gmail.com'` } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.Comp_Name = 'test@gmail.com');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
});
