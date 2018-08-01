'use strict';

const suite = require('core/suite');
const payload = require('core/tools').requirePayload(`${__dirname}/assets/customers.json`);
const payload2 = require('core/tools').requirePayload(`${__dirname}/assets/customers2.json`);
const customerpayload = require('core/tools').requirePayload(`${__dirname}/assets/customersAccounts.json`);
const cloud = require('core/cloud');

//Skipping the test since we have limit for customers to be created in sandbox account and we don't have delete API for sutomers
suite.forElement('rewards', 'customers', {payload: payload, skip: true}, (test) => {
 test.should.supportCrs();
 test.should.supportPagination();
 let customerId;
 it('should support CS for customers/{id}/accounts', () => {
  return cloud.post(test.api, payload2)
   .then(r => customerId = r.body.id)
   .then(r => cloud.post(`${test.api}/${customerId}/accounts`, customerpayload))
   .then(r => cloud.get(`${test.api}/${customerId}/accounts`));
 });
});
