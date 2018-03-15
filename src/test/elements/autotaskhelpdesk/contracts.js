'use strict';

const suite = require('core/suite');
const contractPayload = require('./assets/contracts');

suite.forElement('helpdesk', 'contracts', { payload: contractPayload }, (test) => {
	 test.should.supportCrus();
	 test.withOptions({ qs: { where: 'contactName=\'Wilson, Carl\'' } }).should.return200OnGet();
         test.should.supportPagination('id');
 });
