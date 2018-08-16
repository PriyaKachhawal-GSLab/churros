'use strict';

const suite = require('core/suite');

suite.forElement('rewards', 'accounts', (test) => {
 test.should.supportSr();
 test.should.supportPagination();
});
