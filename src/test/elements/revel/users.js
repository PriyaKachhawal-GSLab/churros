const suite = require('core/suite');
const expect = require('chakram').expect;

suite.forElement('employee', 'users', (test) => {

  test.should.supportPagination();

  test.withApi(test.api)
    .withOptions({ qs: { where: "is_active='false'" } })
    .withValidation(r => expect(r.body.filter(obj => obj.is_active !== true)).to.not.be.empty)
    .withName('should allow GET with option is_active')
    .should.return200OnGet();

  test.withValidation(r => {
    expect(r).to.have.statusCode(200);
    expect(r.body.filter(obj => obj.id !== null)).to.not.be.empty;
  }).should.return200OnGet();
});
