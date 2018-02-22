'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const chakram = require('chakram');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/customer.json`);
const payload1 = tools.requirePayload(`${__dirname}/assets/customer.json`);
const contactPayload = tools.requirePayload(`${__dirname}/assets/contact.json`);
const deliveryLocationPayload = tools.requirePayload(`${__dirname}/assets/deliveryLocation.json`);
suite.forElement('erp', 'customers', { payload: payload }, (test) => {
  test.should.supportCruds(chakram.put);
  test.should.supportNextPagePagination(1);
  test
    .withOptions({ qs: { where: `email  = 'test@gmail.com' ` } })
    .withName('should support Ceql email search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.email = 'test@gmail.com');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
  let customerId;

  before(() => cloud.post(test.api, payload1)
    .then(r => customerId = r.body.id));

  it('should support CRUDS for /customers/:id/contacts', () => {
    let id;
    return cloud.post(`${test.api}/${customerId}/contacts`, contactPayload)
      .then(r => {
        id = r.body.customerContactNumber;
      })
      .then(r => cloud.get(`${test.api}/${customerId}/contacts`))
      .then(r => cloud.put(`${test.api}/${customerId}/contacts/${id}`, contactPayload))
      .then(r => cloud.get(`${test.api}/${customerId}/contacts/${id}`))
      .then(r => cloud.delete(`${test.api}/${customerId}/contacts/${id}`));
  });
  it('should support CRUDS for /customers/:id/delivery-locations', () => {
    let id;
    return cloud.post(`${test.api}/${customerId}/delivery-locations`, deliveryLocationPayload)
      .then(r => {
        id = r.body.deliveryLocationNumber;
      })
      .then(r => cloud.get(`${test.api}/${customerId}/delivery-locations
`))
      .then(r => cloud.put(`${test.api}/${customerId}/delivery-locations/${id}`, deliveryLocationPayload))
      .then(r => cloud.get(`${test.api}/${customerId}/delivery-locations/${id}`))
      .then(r => cloud.delete(`${test.api}/${customerId}/delivery-locations/${id}`));
  });
  after(() => cloud.delete(`${test.api}/${customerId}`));

});
