'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');

const payload = tools.requirePayload(`${__dirname}/assets/plans.json`);

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
  it("Should support create plan on existing product", () => {
    return cloud.get(test.api)
      .then(r => {
        let product_id = r.body[0].product;
        let opts = {

            "interval": "year",
            "currency": "inr",
            "amount": 12,
            "product": product_id

        };
        test.should.supportCd(opts);
      });
  });

});
