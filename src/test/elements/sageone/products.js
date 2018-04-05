'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload = require('./assets/products');
const chakram = require('chakram');
const build = (overrides) => Object.assign({}, payload, overrides);
const productsPayload = build({ item_code: "item" + tools.randomInt() });

suite.forElement('finance', 'products', { payload: productsPayload }, (test) => {
  let code, sales_ledger_account_id, purchase_ledger_account_id, product_sales_price_type_id;
  it(`should support CRUDS ${test.api}`, () => {
    cloud.get(`/hubs/finance/ledger-accounts`)
      .then(r => {
        purchase_ledger_account_id = r.body[0].id;
        sales_ledger_account_id = r.body[1].id;
      });
    cloud.get(`/hubs/finance/product-sales-price-types`)
      .then(r => {
        product_sales_price_type_id = r.body[0].id;
      });
    payload.purchase_ledger_account_id = purchase_ledger_account_id;
    payload.sales_ledger_account_id = sales_ledger_account_id;
    payload.sales_prices[0].product_sales_price_type_id = product_sales_price_type_id;
    test.should.supportCruds(chakram.put);
  });
  test.should.supportPagination();

  it(`should support GET ${test.api}`, () => {
    return cloud.get(test.api)
      .then(r => {
        code = r.body[0].reference;
        test
          .withName(`should support searching ${test.api} by item_code`)
          .withOptions({ qs: { where: `search ='${code}'` } })
          .withValidation((r) => {
            expect(r).to.have.statusCode(200);
            const validValues = r.body.filter(obj => obj.item_code === `${code}`);
            expect(validValues.length).to.equal(r.body.length);
          }).should.return200OnGet();
      });
  });
});
