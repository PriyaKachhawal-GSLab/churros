'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;
suite.forElement('finance', 'sales-tax-items', (test) => {
    test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination();
    test.withApi(test.api)
        .withValidation(r => expect(r.body[0]).to.contain.key('internalId'))
        .withName('should allow GET /sales-tax-items')
        .should.return200OnGet();
});
