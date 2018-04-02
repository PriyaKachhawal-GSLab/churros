'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const payload = require('./assets/products-inventory');

suite.forElement('crm', 'products', { payload: payload }, (test) => {
  // There is no retriveAll operation neither POST operation supported by vendor. Hence productId is hardcoded in the test
  // that is specific to the churros account.
  it('Should allow to GET and PATCH /products/{id}/inventory', () => {
    let productId = 4;
    return cloud.get(`${test.api}/${productId}/inventory`)
      .then(r => cloud.patch(`${test.api}/${productId}/inventory`, payload))
      .then(r => payload.Action = 'decrease')
      .then(r => cloud.patch(`${test.api}/${productId}/inventory`, payload));
  });
});
