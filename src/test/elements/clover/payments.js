const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const paymentPayload = tools.requirePayload(`${__dirname}/assets/payments.json`);

suite.forElement('employee', 'payments', { payload: paymentPayload }, (test) => {

  before(() => cloud.get('/orders')
    .then(r => {
      paymentPayload.orderId = r.body[0].id;
    })
  );
  test.withApi(test.api)
    .withOptions({ qs: { where: "modifiedTime>1508943600000" } })
    .withValidation(r => expect(r.body.filter(obj => obj.id !== "")).to.not.be.empty)
    .withName('should allow GET with option modifiedTime')
    .should.return200OnGet();

    it('should support CRS for payments', () => {
        let pId;
        return cloud.post(test.api, paymentPayload)
          .then(r => pId = r.body.id)
          .then(r => cloud.get(`${test.api}/${pId}`))
          .then(r => cloud.get(test.api))
          .then(r => expect(r.body).to.not.to.be.empty);
      });
});
