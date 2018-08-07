'use strict';

const suite = require('core/suite');

suite.forElement('rewards', 'catalogs', (test) => {
 test.should.supportS();
 test.withOptions({ qs: { where: 'verbose =\'false\'' } }).should.return200OnGet();
});
