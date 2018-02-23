'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const payload = require('./assets/addresses');
var chakram = require('chakram'),
    expect = chakram.expect;

suite.forElement('messaging', 'addresses', {payload: payload}, (test) => {
  test.should.return200OnGet();
  test.should.supportPagination();

  it('should allow CRUDS', () => {
  let AddressSID;
	let query1 = { where: "FriendlyName='Jack'"};
    let query2 = { page: 1, pageSize: 1 };
    return cloud.post('/hubs/messaging/addresses', payload)
    .then(r => AddressSID = r.body.sid)
    .then(r => cloud.get('/hubs/messaging/addresses/' + AddressSID))
	.then(r => cloud.patch('/hubs/messaging/addresses/' +AddressSID, payload))
	.then(r => cloud.get('/hubs/messaging/addresses'))
    .then(r => cloud.withOptions({ qs: query1 }).get('/hubs/messaging/addresses'))
    .then(r => expect(r).to.have.statusCode(200))
	.then(r => cloud.withOptions({query2}).get('/hubs/messaging/addresses/'+AddressSID+'/dependent-phone-numbers'))
	.then(r => expect(r).to.have.statusCode(200))
	.then(r => cloud.delete('/hubs/messaging/addresses/'+AddressSID));
  });
});
