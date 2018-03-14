'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const contractPayload = require('./assets/contracts');

suite.forElement('helpdesk', 'contracts', { payload: contractPayload }, (test) => {
	 test.should.supportCrus();
	 test.withOptions({ qs: { where: 'contactName=\'Wilson, Carl\'' } }).should.return200OnGet();
     test.should.supportPagination('id');
 });
