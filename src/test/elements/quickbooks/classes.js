'use strict';

const suite = require('core/suite');
const chakram = require('chakram');
const expect = chakram.expect;

suite.forElement('finance', 'classes', null, (test) => {
  test.should.supportSr();
  test.withName(`should support searching ${test.api} by Id`)
    .withOptions({ qs: { where: `id ='1234'`, returnCount: true } })
    .withName('Test for search on id and returnCount in response')
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.id = '1234');
      expect(validValues.length).to.equal(r.body.length);
      expect(r.response.headers['elements-total-count']).to.exist;
    }).should.return200OnGet();
});
