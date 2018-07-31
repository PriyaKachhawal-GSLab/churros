'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const returnAddressPayload = tools.requirePayload(`${__dirname}/assets/returnAddress.json`);

//Need to skip as there is no delete API
suite.forElement('rewards', 'return-addresses', {payload: returnAddressPayload, skip: true}, (test) => {
  test.should.supportCs();
});
