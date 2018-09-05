'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

suite.forElement('crm', 'leads', (test) => {
    test.should.supportS();
});
