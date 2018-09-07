'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const collects = tools.requirePayload(`${__dirname}/assets/collects-create.json`);
const customCollections = tools.requirePayload(`${__dirname}/assets/customCollections-create.json`);
const products = tools.requirePayload(`${__dirname}/assets/products-create.json`);

suite.forElement('ecommerce', 'collects', (test) => {
  let productId, customCollectId;
  before(() => cloud.post(`/hubs/ecommerce/products`, products)
    .then(r => productId = r.body.id)
    .then(r => collects.product_id=productId)
    .then(r => cloud.post(`/hubs/ecommerce/custom-collections`, customCollections))
    .then(r => customCollectId = r.body.id)
    .then(r => collects.collection_id=customCollectId)
  );
  test.should.return200OnGet();
  test.withApi(`/hubs/ecommerce/collects-count`).should.return200OnGet();
  it(`should allow CRD for /hubs/ecommerce/collects`, () => {
    let collectId;
    return cloud.post(`/hubs/ecommerce/collects`, collects)
      .then(r => collectId = r.body.id)
      .then(r => cloud.get(`${test.api}/${collectId}`))
      .then(r => cloud.delete(`${test.api}/${collectId}`));
  });
});
