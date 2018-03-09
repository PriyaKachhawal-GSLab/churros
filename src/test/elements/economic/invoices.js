'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const productPayload = tools.requirePayload(`${__dirname}/assets/products.json`);
const customerPayload = tools.requirePayload(`${__dirname}/assets/customer.json`);
const invoiceDraftPayload = tools.requirePayload(`${__dirname}/assets/invoicesDrafts.json`);
const payload = tools.requirePayload(`${__dirname}/assets/invoices.json`);

suite.forElement('erp', 'invoices', {
  payload: payload
}, (test) => {
  let Id, customerId, productId;

  before(() => cloud.post('/hubs/erp/products', productPayload)
    .then(r => productId = r.body.id)
    .then(r => cloud.post('/hubs/erp/customers', customerPayload))
    .then(r => {
      customerId = r.body.id;
      customerId = parseInt(customerId);
    })
    .then(r => invoiceDraftPayload.customer.customerNumber = customerId)
    .then(r => invoiceDraftPayload.lines[0].product.productNumber = productId)
    .then(r => cloud.post('/hubs/erp/invoice-drafts', invoiceDraftPayload))
    .then(r => {
      Id = r.body.id;
      Id = parseInt(Id);
    }));

  test.should.supportSr();
  test.should.supportNextPagePagination(1);
  test.withOptions({ qs: { where: `currency = 'DKK' ` } })
    .withName('should support Ceql currency  search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.currency = 'DKK');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
  it('should support PUT  for /invoices/:id/', () => {
    return cloud.put(`${test.api}/${Id}`);

  });


});
