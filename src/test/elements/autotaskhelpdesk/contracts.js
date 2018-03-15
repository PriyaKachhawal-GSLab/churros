'use strict';

const suite = require('core/suite');
const contractPayload = require('./assets/contracts');
const expect = require('chakram').expect;

suite.forElement('helpdesk', 'contracts', { payload: contractPayload, skip: true }, (test) => {	
	 test.should.supportCrus();
	 test.should.supportPagination('id');
	 test
	 .withOptions({ qs: { where: 'contactName=\'Wilson, Carl\'' } })
	 .withName('should support search by contactName')
	 .withValidation(r => {
		 expect(r).to.statusCode(200);
		 const validValues = r.body.filter(obj => obj.contactName = `Wilson, Carl`);
		 expect(validValues.length).to.equal(r.body.length);
    })
	.should.return200OnGet();
 });