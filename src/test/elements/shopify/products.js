'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const products =  require('./assets/products-create.json');
const updatePayload= require('./assets/products-update.json');
/*const products = (custom) => ({
  title: custom.title || tools.random(),
  product_type: custom.product_type || tools.random()
});*/

suite.forElement('ecommerce', 'products', { payload: products }, (test) => {

const options = {
churros: {
updatePayload: updatePayload
}
};

  test.should.supportCruds();
  it('should allow GET for /products with use of the `orderBy` parameter', () => {
    return cloud.withOptions({qs: {orderBy: 'updated_at'}}).get(test.api)
      .then(r => cloud.withOptions({qs: {orderBy: 'created_at'}}).get(test.api));
  });
});
