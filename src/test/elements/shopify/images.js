'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const payload = require('./assets/products.json');
const variantPayload = require('./assets/variants-create.json');
const imageUpdate = { "src": "http://petsfans.com/wp-content/uploads/2014/11/edfsaf.jpg" };

suite.forElement('ecommerce', 'images', { payload: payload }, (test) => {

  it('should allow CRUDS for /products/:id/images', () => {
    let productId, imageId, imagePayload, variantId;
    return cloud.post('/hubs/ecommerce/products', payload)
      .then(r => productId = r.body.id)
      .then(r => cloud.post('/hubs/ecommerce/products/' + productId + '/variants', variantPayload))
      .then(r => variantId = r.body.id)
      .then(r => imagePayload = {
        "src": "https://cdn.shopify.com/s/files/1/0655/4311/products/maxresdefault_f2cd1654-dc20-4c33-8be8-03b157763958.jpeg?v=1457997527",
        "product_id": productId,
        "variant_ids": [
          variantId
        ],
        "position": 1
      })
      .then(r => cloud.post('/hubs/ecommerce/products/' + productId + '/images', imagePayload))
      .then(r => imageId = r.body.id)
      .then(r => cloud.get('/hubs/ecommerce/products/' + productId + '/images'))
      .then(r => cloud.get('/hubs/ecommerce/products/' + productId + '/images/' + imageId))
      .then(r => cloud.patch('/hubs/ecommerce/products/' + productId + '/images/' + imageId, imageUpdate))
      .then(r => cloud.delete('/hubs/ecommerce/products/' + productId + '/images/' + imageId))
      .then(r => cloud.delete('/hubs/ecommerce/products/' + productId));
  });
});
