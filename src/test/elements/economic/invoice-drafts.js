'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const chakram = require('chakram');
const expect = chakram.expect;
const productPayload = tools.requirePayload(`${__dirname}/assets/products.json`);
const customerPayload = tools.requirePayload(`${__dirname}/assets/customer.json`);

const payload = tools.requirePayload(`${__dirname}/assets/invoicesDrafts.json`);

suite.forElement('erp', 'invoice-drafts', { payload: payload }, (test) => {
  let customerId, productId;

  before(() => cloud.post('/hubs/erp/products', productPayload)
    .then(r => productId = r.body.id)
    .then(r => cloud.post('/hubs/erp/customers', customerPayload))
    .then(r => {
      customerId = r.body.id;
      customerId = parseInt(customerId);
    })
    .then(r => payload.customer.customerNumber = customerId)
    .then(r => payload.lines[0].product.productNumber = productId)
  );
  after(() => cloud.delete(`/hubs/erp/products/${productId}`)
    .then(r => cloud.delete(`/hubs/erp/customers/${customerId}`)));

  test.should.supportCruds(chakram.put);
  test.should.supportNextPagePagination(1);
  test
    .withOptions({ qs: { where: `currency = 'DKK' ` } })
    .withName('should support Ceql currency  search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.currency = 'DKK');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();

});
