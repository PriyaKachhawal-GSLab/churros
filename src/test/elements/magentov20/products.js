'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const expect = require('chakram').expect;
const productPayload = require(`./assets/products`);
const customerGroup = tools.requirePayload(`${__dirname}/assets/customerGroup.json`);

const productsWebsites = (sku) => ({
  "productWebsiteLink": {
    "sku": sku,
    "website_id": 1
  }
});
const productsOptionsPost = (sku) => ({
  "option": {
    "product_sku": sku,
    "price": 0,
    "max_characters": 0,
    "price_type": "fixed",
    "is_require": true,
    "title": "ChurrosTestPost",
    "type": "field",
    "sort_order": 0
  }
});
const productsOptionsPatch = (sku) => ({
  "option": {
    "product_sku": sku,
    "price": 0,
    "max_characters": 0,
    "price_type": "fixed",
    "option_id": 2,
    "is_require": true,
    "title": "ChurrosTestPatch",
    "type": "field",
    "sort_order": 0
  }
});

const productsGroupPrices = () => ({
  "qty": "1",
  "price": "1"
});

suite.forElement('ecommerce', 'products', { payload: productPayload }, (test) => {
  let attributeSetId, createdAt, sku, entryId, optionId;

  test.should.return200OnGet();
  productPayload.product.name = tools.random();
  productPayload.product.sku = "sku" + tools.randomInt();
  productPayload.product.custom_attributes[0].value = tools.random();

  it(`should allow CRUDS for ${test.api}`, () => {
    return cloud.get(`/hubs/ecommerce/products-attribute-sets`)
      .then(r => attributeSetId = r.body[0].id)
      .then(r => cloud.post(`${test.api}`, productPayload))
      .then(r => {
        sku = r.body.sku;
        createdAt = r.body.created_at;
      })
      .then(r => cloud.get(`${test.api}/${sku}`))
      .then(r => cloud.patch(`${test.api}/${sku}`, productPayload))
      .then(r => cloud.delete(`${test.api}/${sku}`));
  });
  test
    .withName(`should support searching ${test.api} by created_at`)
    .withOptions({ qs: { where: `created_at='${createdAt}'` } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.created_at === createdAt);
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();

  it(`should allow CRS for /hubs/ecommerce/products-options`, () => {
    return cloud.get(`/hubs/ecommerce/products-attribute-sets`)
      .then(r => attributeSetId = r.body[0].id)
      .then(r => cloud.post(test.api, productPayload))
      .then(r => sku = r.body.sku)
      .then(r => cloud.get(`${test.api}/${sku}/options`))
      .then(r => cloud.post(`/hubs/ecommerce/products-options`, productsOptionsPost(sku)))
      .then(r => optionId = r.body.option_id)
      .then(r => cloud.get(`${test.api}/${sku}/options/${optionId}`))
      .then(r => cloud.patch(`/hubs/ecommerce/products-options/${optionId}`, productsOptionsPatch(sku)))
      .then(r => cloud.delete(`${test.api}/${sku}`));
  });
  it.skip(`should allow DELETE for ${test.api}/{sku}/options/{optionId}`, () => { //No post so not deleting
    return cloud.delete(`${test.api}/${sku}/options/${optionId}`);
  });

  test.withApi(`/hubs/ecommerce/products-options-types`).should.return200OnGet();
  test.withApi(`/hubs/ecommerce/products-types`).should.return200OnGet();

  it(`should allow GET for /hubs/ecommerce/products-links-types`, () => {
    return cloud.get(`/hubs/ecommerce/products-links-types`)
      .then(r => cloud.get(`/hubs/ecommerce/products-links/${r.body.name}/attributes`));
  });
  it(`should allow CUD for /hubs/ecommerce/products/{sku}/websites`, () => {
    let websiteId = 1;
    return cloud.get(`/hubs/ecommerce/products-attribute-sets`)
      .then(r => attributeSetId = r.body[0].id)
      .then(r => cloud.post(test.api, productPayload))
      .then(r => sku = r.body.sku)
      .then(r => cloud.post(`/hubs/ecommerce/products/${sku}/websites`, productsWebsites(sku)))
      .then(r => cloud.put(`/hubs/ecommerce/products/${sku}/websites`, productsWebsites(sku)))
      .then(r => cloud.delete(`/hubs/ecommerce/products/${sku}/websites/${websiteId}`))
      .then(r => cloud.delete(`${test.api}/${sku}`));
  });
  it(`should allow GET for /hubs/ecommerce/products/{sku}/media`, () => {
    return cloud.get(`/hubs/ecommerce/products`)
      .then(r => sku = r.body[1].sku)
      .then(r => cloud.get(`${test.api}/${sku}/media`))
      .then(r => entryId = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${sku}/media/${entryId}`));
  });
  it.skip(`should allow DELETE for ${test.api}/{sku}/media/{entryId}`, () => { //No post so not deleting
    return cloud.delete(`${test.api}/${sku}/media/${entryId}`);
  });

  it(`should allow CRD for /hubs/ecommerce/products/{sku}/group-prices/{customerGroupId}/tiers`, () => {
    let customerGroupId, qty = 1;
    return cloud.get(`/hubs/ecommerce/products-attribute-sets`)
      .then(r => attributeSetId = r.body[0].id)
      .then(r => cloud.post(test.api, productPayload))
      .then(r => sku = r.body.sku)
      .then(r => cloud.post(`/hubs/ecommerce/customer-groups`, customerGroup))
      .then(r => customerGroupId = r.body.id)
      .then(r => cloud.post(`/hubs/ecommerce/products/${sku}/group-prices/${customerGroupId}/tiers`, productsGroupPrices()))
      .then(r => cloud.delete(`/hubs/ecommerce/products/${sku}/group-prices/${customerGroupId}/tiers/${qty}`))
      .then(r => cloud.delete(`/hubs/ecommerce/customer-groups/${customerGroupId}`))
      .then(r => cloud.delete(`${test.api}/${sku}`));
  });
  it(`should allow GET for /hubs/ecommerce/products-media-types`, () => {
    let attributeSetName;
    return cloud.get(`/hubs/ecommerce/products-attribute-sets`)
      .then(r => attributeSetName = r.body[0].attribute_set_name)
      .then(r => cloud.get(`/hubs/ecommerce/products-media-types/${attributeSetName}`));
  });
  test.should.supportPagination();
});
