'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/products-create.json`);
const variantPayload = tools.requirePayload(`${__dirname}/assets/variants-create.json`);
const imagePayload = tools.requirePayload(`${__dirname}/assets/images-create.json`);
const imageUpdate = tools.requirePayload(`${__dirname}/assets/images-update.json`);

suite.forElement('ecommerce', 'images', { payload: payload }, (test) => {
  it('should allow CRUDS for /products/:id/images', () => {
    let productId, imageId, variantId;
    return cloud.post('/hubs/ecommerce/products', payload)
      .then(r => productId = r.body.id)
      .then(r => imagePayload.product_id = productId)
      .then(r => cloud.post('/hubs/ecommerce/products/' + productId + '/variants', variantPayload))
      .then(r => variantId = r.body.id)
      .then(r => imagePayload.variant_ids[0] = variantId)
      .then(r => cloud.post('/hubs/ecommerce/products/' + productId + '/images', imagePayload))
      .then(r => imageId = r.body.id)
      .then(r => cloud.get('/hubs/ecommerce/products/' + productId + '/images'))
      .then(r => cloud.get('/hubs/ecommerce/products/' + productId + '/images/' + imageId))
      .then(r => cloud.patch('/hubs/ecommerce/products/' + productId + '/images/' + imageId, imageUpdate))
      .then(r => cloud.delete('/hubs/ecommerce/products/' + productId + '/images/' + imageId))
      .then(r => cloud.delete('/hubs/ecommerce/products/' + productId));
  });
});
