'use strict';

const suite = require('core/suite');
const payload = require('./assets/products');

suite.forElement('ecommerce', 'products', payload, (test) => {
  test.should.supportCruds();
});
