'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const payload = require('./assets/products');

suite.forElement('crm', 'products', { payload: payload }, (test) => {

  it('Should allow to GET and PATCH /products/{id}/inventory', () => {
    return cloud.get(`${test.api}/4/inventory`)
      .then(r => cloud.patch(`${test.api}/4/inventory`, payload))
      .then(r => payload.Action = 'decrease')
      .then(r => cloud.patch(`${test.api}/4/inventory`, payload));
  });
});
