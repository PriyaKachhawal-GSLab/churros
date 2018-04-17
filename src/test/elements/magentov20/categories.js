'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/categories.json`);
const payload2 = tools.requirePayload(`${__dirname}/assets/categories.json`);

const categoryProduct = (categoryId, position, sku) => ({
  "productLink": {
    "sku": sku,
    "position": position,
    "category_id": categoryId
  }
});
const categoryMove = (parentId) => ({
  "parentId": parentId,
  "afterId": 3
});
const product = (attributeSetId) => ({
  "product": {
    "attribute_set_id": attributeSetId,
    "name": tools.randomStr('abcdefghijklmnopqrstuvwxyz', 10),
    "price": 300,
    "sku": "ce" + tools.randomInt(),
    "status": 1,
    "type_id": "simple",
    "visibility": 4,
    "custom_attributes": [{
      "attribute_code": "description",
      "value": tools.random()
    }]
  }
});
suite.forElement('ecommerce', 'categories', { payload: payload }, (test) => {
  let frontendInput = 'text',
    categoryId;
  test.should.supportCruds();
  test
    .withName(`should support searching ${test.api} by depth`)
    .withOptions({ qs: { where: 'depth = 1' } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.level === 1);
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();

  it(`should allow SR for /hubs/ecommerce/categories-attributes`, () => {
    return cloud.get(`/hubs/ecommerce/categories-attributes`)
      .then(r => cloud.get(`/hubs/ecommerce/categories-attributes/${r.body[0].attribute_code}`));
  });

  test
    .withName(`should support searching /hubs/ecommerce/categories-attributes by frontend_input`)
    .withOptions({ qs: { where: `frontend_input = '${frontendInput}'` } })
    .withApi(`/hubs/ecommerce/categories-attributes`)
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.frontend_input === 'text');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();

  it(`should allow GET for /hubs/ecommerce/categories/attributes/{attributeCode}/options`, () => {
    return cloud.get(`/hubs/ecommerce/categories-attributes`)
      .then(r => cloud.get(`/hubs/ecommerce/categories-attributes/${r.body[0].attribute_code}/options`));
  });
  it(`should allow PATCH for /hubs/ecommerce/categories/{id}/move`, () => {
    let parentId;
    return cloud.post(`/hubs/ecommerce/categories`, payload)
      .then(r => categoryId = r.body.id)
      .then(r => cloud.get(`/hubs/ecommerce/categories/${categoryId}`))
      .then(r => parentId = r.body.parent_id)
      .then(r => cloud.patch(`/hubs/ecommerce/categories/${categoryId}/move`, categoryMove(parentId)))
      .then(r => cloud.delete(`/hubs/ecommerce/categories/${categoryId}`));
  });
  it(`should allow CUDS for /hubs/ecommerce/categories/{id}/products`, () => {
    let position, sku, attributeSetId;
    return cloud.post(`/hubs/ecommerce/categories`, payload2)
      .then(r => categoryId = r.body.id)
      .then(r => cloud.get(`/hubs/ecommerce/categories/${categoryId}`))
      .then(r => position = r.body.position)
      .then(r => cloud.get(`/hubs/ecommerce/products-attribute-sets`))
      .then(r => attributeSetId = r.body[0].id)
      .then(r => cloud.post(`/hubs/ecommerce/products`, product(attributeSetId)))
      .then(r => sku = r.body.sku)
      .then(r => cloud.post(`/hubs/ecommerce/categories/${categoryId}/products`, categoryProduct(categoryId, position, sku)))
      .then(r => cloud.put(`/hubs/ecommerce/categories/${categoryId}/products`, categoryProduct(categoryId, position, sku)))
      .then(r => cloud.delete(`/hubs/ecommerce/categories/${categoryId}/products/${sku}`))
      .then(r => cloud.delete(`/hubs/ecommerce/categories/${categoryId}`));
  });
  test.should.supportPagination();
});
