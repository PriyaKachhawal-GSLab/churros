'use strict';

const suite = require('core/suite');

suite.forElement('general', 'profile', null, (test) => {

	test.should.return200OnGet();
});
