'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const chakram = require('chakram');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/customer.json`);
const payload1 = tools.requirePayload(`${__dirname}/assets/customer.json`);
const contactPayload = tools.requirePayload(`${__dirname}/assets/contact.json`);
const deliveryLocationPayload = tools.requirePayload(`${__dirname}/assets/deliveryLocation.json`);
suite.forElement('erp', 'customers', { payload: payload }, (test) => {
  test.should.supportCruds(chakram.put);
  test.should.supportNextPagePagination(1);
  test.withOptions({ qs: { where: `email  = 'test@gmail.com' ` } })
    .withName('should support Ceql email search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.email = 'test@gmail.com');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
  let customerId;

  before(() => cloud.post(test.api, payload1)
    .then(r => customerId = r.body.id));

  after(() => cloud.delete(`${test.api}/${customerId}`));

  it('should support CRUDS for /customers/:id/contacts', () => {
    return cloud.cruds(`${test.api}/${customerId}/contacts`, contactPayload,chakram.put);
  });
  it(`should support CRUDS for /customers/:id/delivery-locations`, () => {
    return cloud.cruds(`${test.api}/${customerId}/delivery-locations`, deliveryLocationPayload,chakram.put);
  });

});
