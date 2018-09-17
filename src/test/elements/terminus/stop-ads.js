'use strict';

const suite = require('core/suite');

suite.forElement('marketing', 'stop-ads', (test) => {
  test.withOptions({ qs: { id: 'b9cd602d-9794-4dd3-98ed-68cb298aa937', companyId: '["1001"]' } }).should.return200OnPost();
});
