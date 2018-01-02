'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;
const tools = require('core/tools');
const productsCategoriesPayload = () => ({
  "name":tools.random()
});

suite.forElement('ecommerce', 'products-categories', { payload: productsCategoriesPayload() }, (test) => {
  test.should.supportCruds();
  // unique is "id"
  test.should.supportPagination();
  test
  .withName(`should support searching ${test.api} by slug`)
  .withOptions({ qs: { where: 'slug = \'albums\'' } })
  .withValidation((r) => {
  expect(r).to.have.statusCode(200);
  const validValues = r.body.filter(obj => obj.slug ==='albums');
  expect(validValues.length).to.equal(r.body.length);
  }).should.return200OnGet();
});
