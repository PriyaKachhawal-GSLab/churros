'use strict';

const suite = require('core/suite');
const chakram = require('chakram');
const expect = chakram.expect;
const productsPayload = require('./assets/products');

suite.forElement('crm', 'products', { payload: productsPayload }, (test) => {

  test.should.supportCruds(chakram.put);
  test.should.supportPagination();
  test.withName(`should support searching ${test.api} by word`)
    .withOptions({ qs: { where: 'word=\'Test\'' } })
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => JSON.stringify(obj).toLowerCase().indexOf('test'));
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();

});
