'use strict';

const suite = require('core/suite');
const payload = require('./assets/products');
const chakram = require('chakram');
const tools = require('core/tools');
const cloud = require('core/cloud');
const build = (overrides) => Object.assign({}, payload, overrides);
const accountsPayload = build({ Name: tools.random(), SKU: tools.random() });

suite.forElement('payment', 'products', { payload: accountsPayload }, (test) => {
  const options = {
    churros: {
      updatePayload: {
        "Name": tools.random()
      }
    }
  };
  test.withOptions(options).should.supportCruds(chakram.put);
  test.should.supportNextPagePagination(2);
  test.should.supportCeqlSearch('id');

  it('should allow S for /hubs/payment/products/{id}/product-rate-plans', () => {
    let productId = -1;
    return cloud.get(test.api)
      .then(r => productId = r.body[0].id)
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${productId}/product-rate-plans`));
  });
});
