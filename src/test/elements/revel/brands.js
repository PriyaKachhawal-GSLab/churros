const suite = require('core/suite');
const expect = require('chakram').expect;


suite.forElement('employee', 'brands', (test) => {

  test.should.supportPagination();
  test.withValidation(r => {
    expect(r).to.have.statusCode(200);
    expect(r.body.filter(obj => obj.id !== null)).to.not.be.empty;
  }).should.return200OnGet();
});
