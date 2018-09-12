'use strict';


const suite = require('core/suite');

suite.forElement('crm', 'report-types', (test) => {
    test.should.supportPagination();
    test.should.supportS();
});