'use strict';

const suite = require('core/suite');

suite.forElement('general', 'accounts', (test) => {
    it('should allow GET /accounts', () => {
        return test.should.return200OnGet();
    });
    it('should allow GET /accounts/account-summaries', () => {
        return test.withApi(`${test.api}/account-summaries`).should.return200OnGet();
    });
});