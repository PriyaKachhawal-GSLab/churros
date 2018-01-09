const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/order.json`);

suite.forElement('employee', 'orders', {payload:payload}, (test) => {
  test.withApi(test.api)
    .withOptions({ qs: { where: "modifiedTime>1508943600000" } })
    .withValidation(r => expect(r.body.filter(obj => obj.id !== "")).to.not.be.empty)
    .withName('should allow GET with option modifiedTime')
    .should.return200OnGet();

  test.withApi(test.api)
    .withOptions({ qs: { where: "title='sweater'" } })
    .withValidation(r => expect(r.body.filter(obj => obj.title === 'Sweater')).to.not.be.empty)
    .withName('should allow GET with option title')
    .should.return200OnGet();

  test.should.supportPagination();
  test.should.supportCruds();
});
