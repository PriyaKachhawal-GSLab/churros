'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/compositeEmployee-create.json`);

suite.forElement('Humancapital', 'composite-employee', { payload: payload }, (test) => {
  test.should.return200OnPost();
});
