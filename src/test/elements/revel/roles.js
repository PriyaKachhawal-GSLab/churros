const suite = require('core/suite');
const expect = require('chakram').expect;


suite.forElement('employee', 'roles', (test) => {

  test.withApi(test.api)
    .withOptions({ qs: { where: "active='true'" } })
    .withValidation(r => expect(r.body.filter(obj => obj.active !== false)).to.not.be.empty)
    .withName('should allow GET with option active')
    .should.return200OnGet();

  test.withValidation(r => {
    expect(r).to.have.statusCode(200);
    expect(r.body[0].id).to.not.be.empty;
  }).should.supportSr();
});
