'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/customers.json`);
const payload2 = tools.requirePayload(`${__dirname}/assets/customers2.json`);
const customerpayload = tools.requirePayload(`${__dirname}/assets/customersAccounts.json`);
const cloud = require('core/cloud');

//Skipping the test since we have limit for customers to be created in sandbox account and we don't have delete API for sutomers
suite.forElement('rewards', 'customers', { payload: payload, skip: true }, (test) => {
  test.should.supportCrs();
  test.should.supportPagination();
  it('should support CS for customers/{id}/accounts', () => {
    let customerId;
    return cloud.post(test.api, payload2)
      .then(r => customerId = r.body.id)
      .then(r => cloud.post(`${test.api}/${customerId}/accounts`, customerpayload))
      .then(r => cloud.get(`${test.api}/${customerId}/accounts`));
  });
});
