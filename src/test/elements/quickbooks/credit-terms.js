'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const chakram = require('chakram');
const expect = chakram.expect;
const payload = tools.requirePayload(`${__dirname}/assets/credit-terms.json`);

//Need to skip as there is no delete API
suite.forElement('finance', 'credit-terms', { payload: payload }, (test) => {
  test.should.supportSr();
  test.withOptions({skip:true}).should.return200OnPost();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.return200OnGet();
  test.withName(`should support searching ${test.api} by Id and returnCount in response`)
    .withOptions({ qs: { where: `id ='1234'`, returnCount: true } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.id = '1234');
      expect(validValues.length).to.equal(r.body.length);
      expect(r.response.headers['elements-total-count']).to.exist;
    }).should.return200OnGet();


});
