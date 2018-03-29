'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
let payload = tools.requirePayload(`${__dirname}/assets/account.json`);

suite.forElement('humancapital', 'accounts', {payload}, (test) => {
    test.should.supportNextPagePagination(1);
    test.should.supportCruds();
});