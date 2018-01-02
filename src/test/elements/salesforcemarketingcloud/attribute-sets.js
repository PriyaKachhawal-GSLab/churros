'use strict';
const suite = require('core/suite');

suite.forElement('marketing', 'attribute-sets', (test) => {
    test.should.return200OnGet();
    test.should.supportPagination();
});
