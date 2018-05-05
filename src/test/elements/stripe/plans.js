'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

const payload = tools.requirePayload(`${__dirname}/assets/plans.json`);
const plansWithProduct = tools.requirePayload(`${__dirname}/assets/plansWithProduct.json`);

const options = {
  churros: {
    updatePayload: {
      "name": tools.random()
    }
  }
};

suite.forElement('payment', 'plans', { payload: payload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withApi(test.api).withOptions({ qs: { where: `created >= 1463157076` } }).should.return200OnGet();
  test.should.supportPagination();
  test.should.supportNextPagePagination(1);
  it("Should support create plan on existing and non-existing product", () => {
    return cloud.get(test.api)
      .then(r => {
        let product_id = r.body[0].product;
        let opts = plansWithProduct;
        opts.product = product_id;
        cloud.cd(test.api, opts);
        opts = plansWithProduct;
        opts.product = {};
        opts.product.id = r.body[0].product;
        return cloud.cd(test.api, opts);
      })
      .then(r => {
        let opts = plansWithProduct;
        opts.product = {};
        opts.product.id = tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 10);
        return cloud.post(test.api, opts, (r) => expect(r).to.have.statusCode(400));
      })
      .then(r => {
        let opts = plansWithProduct;
        opts.product = {};
        opts.product.name = tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 10);
        return cloud.cd(test.api, opts);
      });
  });
});
