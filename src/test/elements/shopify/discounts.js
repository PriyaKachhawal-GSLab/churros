'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const discount = tools.requirePayload(`${__dirname}/assets/discounts-create.json`);

// deprecated api
suite.forElement('ecommerce', 'discounts', { payload: discount, skip: true }, (test) => {
  test.should.supportCrds();
});
