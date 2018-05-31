'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;
const cloud = require('core/cloud');

suite.forElement('finance', 'accounts', (test) => {
	let accountId;
	it(`should support S and support searching for ${test.api} by account_ids`, () => {
		return cloud.get(test.api)
		.then(r => accountId = r.body[0].id)
		.then(r => cloud.withOptions({ qs: { where: `account_ids = '${accountId}'` } }).get(`${test.api}`))
      	.then(r => expect(r.body.length).to.equal(r.body.filter(obj => obj.id === accountId).length));
  	});
	test.should.supportPagination();
});
