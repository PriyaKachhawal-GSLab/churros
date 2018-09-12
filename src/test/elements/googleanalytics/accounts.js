'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const chakram = require('chakram');
const expect = chakram.expect;
const cloud = require('core/cloud');

suite.forElement('general', 'accounts', (test) => {
    it('should allow GET /accounts', () => {
        return test.should.return200OnGet();
    });
    it('should allow GET /accounts/account-summaries', () => {
        return test.withApi(`${test.api}/account-summaries`).should.return200OnGet();
    });
});