'use strict';

const suite = require('core/suite');
const payload = require('./assets/start-ads');

suite.forElement('marketing', 'start-ads', { payload: payload }, (test) => {
  test.withOptions({ qs: { id: 'b9cd602d-9794-4dd3-98ed-68cb298aa937' } }).should.return200OnPost();
});
