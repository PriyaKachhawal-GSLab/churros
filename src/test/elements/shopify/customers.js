'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');

const customer =  require('./assets/customers-create');
const updatePayload =  require('./assets/customers-update');

/*const customer = (custom) => ({
  first_name: custom.firstName || 'Bill',
  last_name: custom.lastName || 'Murray',
  email: custom.email || tools.randomEmail()
});*/

suite.forElement('ecommerce', 'customers', { payload: customer }, (test) => {


const options = {
churros: {
updatePayload: updatePayload
}
};


  test.should.supportCruds();
  it(`should allow GET for /hubs/ecommerce/customers/{id}/order and /hubs/ecommerce/customers/{id}/abandoned-checkouts`, () => {
    let customertId;
    return cloud.post(test.api,customer)
    .then(r => customertId = r.body.id)
    .then(r => cloud.get(`${test.api}/${customertId}/orders`))
    .then(r => cloud.get(`${test.api}/${customertId}/abandoned-checkouts`))
    .then(r => cloud.delete(`${test.api}/${customertId}`));
  });
  it('should allow GET for /customers with use of the `orderBy` parameter', () => {
    return cloud.withOptions({qs: {orderBy: 'updated_at'}}).get(test.api)
      .then(r => cloud.withOptions({qs: {orderBy: 'last_order_date'}}).get(test.api));
  });
});
