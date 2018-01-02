const suite = require('core/suite');
const chakram = require('chakram');
const expect = chakram.expect;

suite.forElement('finance', 'tax-codes', null, (test) => {
  test.should.supportPagination();
  test.should.supportS();
  test.withName(`should support searching ${test.api} by Id`)
    .withOptions({ qs: { where: `id ='1234'` } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.id = '1234');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();

});
