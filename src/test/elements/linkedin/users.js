'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/shares.json`);

//Need to skip as there is no delete API
suite.forElement('social', 'user/me', { payload: payload }, (test) => {
  test.withOptions({ qs: { language: `en_US` } }).should.return200OnGet();
  test.withApi(`${test.api}/detailed`).withOptions({ qs: { language: `en_US` } }).should.return200OnGet();
  test.withApi(`${test.api}/shares`).withOptions({ skip: true }).should.return200OnPost();
});
