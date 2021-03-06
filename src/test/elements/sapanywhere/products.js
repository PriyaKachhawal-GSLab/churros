'use strict';

const suite = require('core/suite');
const payload = require('./assets/products');
const tools = require('core/tools');
const build = (overrides) => Object.assign({}, payload, overrides);
const productsPayload = build({ name: tools.random(), code: tools.randomInt() });

suite.forElement('ecommerce', 'products', { payload: productsPayload, skip: true }, (test) => {
  const options = {
    churros: {
      updatePayload: {
        "name": " Nylon shirt3"
      }
    }
  };
  test.should.supportSr();
  test.withOptions(options).should.supportCruds();
  test.should.supportPagination();
  test.withOptions({ qs: { where: 'code = \'P005\'' } }).should.return200OnGet();
  test.withApi(test.api + '/count').should.return200OnGet();
  test.withApi(test.api + '/count').withOptions({ qs: { where: 'name = \'Cotton pants\'' } }).should.return200OnGet();
  test.withApi(test.api + '/variant-values/count').should.return200OnGet();
  test.withApi(test.api + '/variant-values/count').withOptions({ qs: { where: 'value = \'Color\'' } }).should.return200OnGet();
  test.withApi(test.api + '/metadata/fields').should.return200OnGet();
});
