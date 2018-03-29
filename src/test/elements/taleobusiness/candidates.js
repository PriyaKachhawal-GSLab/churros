'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
let payload = tools.requirePayload(`${__dirname}/assets/candidate.json`);

suite.forElement('humancapital', 'candidates', {payload}, (test) => {
    test.should.supportNextPagePagination(1);
    test.should.supportCruds();
});