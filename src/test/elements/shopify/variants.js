'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const payload = require('./assets/products.json');
const variantPayload = require('./assets/variants-create.json');
const variantUpdate = require('./assets/variants-update.json');


suite.forElement('ecommerce', 'variants', { payload: payload }, (test) => {

  it('should allow CRUDS for /products/:id/variants', () => {
    let productId;
    let variantId;
    return cloud.post('/hubs/ecommerce/products', payload)
      .then(r => productId = r.body.id)
      .then(r => cloud.post('/hubs/ecommerce/products/' + productId + '/variants', variantPayload))
      .then(r => variantId = r.body.id)
      .then(r => cloud.get('/hubs/ecommerce/products/' + productId + '/variants'))
      .then(r => cloud.get('/hubs/ecommerce/variants/' + variantId))
      .then(r => cloud.patch('/hubs/ecommerce/variants/' + variantId, variantUpdate))
      .then(r => cloud.delete('/hubs/ecommerce/products/' + productId + '/variants/' + variantId))
      .then(r => cloud.delete('/hubs/ecommerce/products/' + productId));
  });
});
