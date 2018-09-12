'use strict';


const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');

suite.forElement('crm', 'report-types', (test) => {
    test.should.supportPagination();
    test.should.supportS();
});