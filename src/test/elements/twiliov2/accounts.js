'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const payload = require('./assets/addresses');
var chakram = require('chakram'),
    expect = chakram.expect;

suite.forElement('messaging', 'accounts', {payload: payload}, (test) => {
  test.should.return200OnGet();
  test.should.supportPagination();

  it('should allow RUS', () => {
    let AccountSID;
	let query = { where: "FriendlyName='Jack' AND Status='suspended'"};
    return cloud.get('/hubs/messaging/accounts')
    .then(r => AccountSID = r.body[0].sid)
    .then(r => cloud.get('/hubs/messaging/accounts/' + AccountSID))
	.then(r => cloud.put('/hubs/messaging/accounts/' + AccountSID, payload))
    .then(r => cloud.withOptions({ qs: query }).get('/hubs/messaging/accounts'))
	.then(r => expect(r).to.have.statusCode(200));
	});
});
