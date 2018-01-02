'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

let employee = tools.requirePayload(`${__dirname}/assets/employee.json`);

suite.forElement('finance', 'employees', {payload: employee}, (test) => {
    afterEach(done => {
        // to avoid rate limit errors
        setTimeout(done, 5000);
    });
    
    test.should.supportPagination();
    test.should.supportCruds();
});