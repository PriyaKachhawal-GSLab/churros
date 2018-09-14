'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const queryParam = tools.requirePayload(`${__dirname}/assets/query-requiredQueryParam-r.json`);
suite.forElement('ecommerce', 'query', (test) => {
  test.withName('should allow querying for customers').withOptions({ qs: queryParam }).should.return200OnGet();
  test.withName('should allow querying for customers id and email').withOptions({ qs: queryParam }).should.return200OnGet();
});
