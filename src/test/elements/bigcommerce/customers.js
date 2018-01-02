'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/customers.json`);
const addressPayload = tools.requirePayload(`${__dirname}/assets/address.json`);
const groupPayload = tools.requirePayload(`${__dirname}/assets/group.json`);


suite.forElement('ecommerce', 'customers', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.withApi(`${test.api}/count`).should.return200OnGet();
  /* updated the where query from  'fetchShippingAddresses=\'true\'' to
    where: 'email=\'jamesbrown@theking.com\'' as fetchShippingAddresses field not present in
    response and vendor response is failing with 504 Gateway Time-out error
  */
  test.withOptions({ qs: { where: 'email=\'jamesbrown@theking.com\'' } }).should.return200OnGet();
  test.should.supportPagination();
  test.should.supportCeqlSearch('email');
  it('should allow CRUDS for customer/addresses', () => {
    let customersId = -1;
    let addressId = -1;
    return cloud.post(test.api, payload)
      .then(r => customersId = r.body.id)
      .then(r => cloud.get(`${test.api}/${customersId}`))
      .then(r => cloud.get(`${test.api}/${customersId}/addresses`))
      .then(r => cloud.post(`${test.api}/${customersId}/addresses`, addressPayload))
      .then(r => addressId = r.body.id)
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${customersId}/addresses`))
      .then(r => cloud.get(`${test.api}/${customersId}/addresses/${addressId}`))
      .then(r => cloud.patch(`${test.api}/${customersId}/addresses/${addressId}`, addressPayload))
      .then(r => cloud.delete(`${test.api}/${customersId}/addresses/${addressId}`))
      .then(r => cloud.delete(`${test.api}/${customersId}`));
  });
  it('should allow CRUDS for customer/groups and then GET customer/groups/count', () => {
    let groupId = -1;

    return cloud.post(`${test.api}/groups`, groupPayload)
      .then(r => groupId = r.body.id)
      .then(r => cloud.get(`${test.api}/groups`))
      .then(r => cloud.get(`${test.api}/groups/${groupId}`))
      .then(r => cloud.withOptions({ qs: { where: `name='${groupPayload.name}'` } }).get(`${test.api}/groups`))
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/groups`))
      .then(r => cloud.patch(`${test.api}/groups/${groupId}`,groupPayload))
      .then(r => cloud.get(`${test.api}/groups/${groupId}`))
      .then(r => cloud.delete(`${test.api}/groups/${groupId}`))
      .then(r => cloud.get(`${test.api}/groups/count`));
  });
});
