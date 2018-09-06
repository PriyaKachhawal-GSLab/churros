'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const products = tools.requirePayload(`${__dirname}/assets/products-create.json`);
const updatePayload = tools.requirePayload(`${__dirname}/assets/products-update.json`);

suite.forElement('ecommerce', 'products', { payload: products }, (test) => {
  const options = {
    churros: {
      updatePayload: updatePayload
    }
  };
  test.withOptions(options).should.supportCruds();
  it('should allow GET for /products with use of the `orderBy` parameter', () => {
    return cloud.withOptions({ qs: { orderBy: 'updated_at' } }).get(test.api)
      .then(r => cloud.withOptions({ qs: { orderBy: 'created_at' } }).get(test.api));
  });
});
