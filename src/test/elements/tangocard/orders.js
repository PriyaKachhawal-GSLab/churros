'use strict';

const suite = require('core/suite');
const payload = require('core/tools').requirePayload(`${__dirname}/assets/orders.json`);
const payload2 = require('core/tools').requirePayload(`${__dirname}/assets/orders2.json`);
const cloud = require('core/cloud');
const expect = require('chakram').expect;

//Skipping the test since there are limits to the orders we can post and there are no delete API supported
suite.forElement('rewards', 'orders', {payload: payload}, (test) => {
 test.should.supportCrs();
 test.should.supportPagination();

 let orderId,externalRefId;
 it('should support C for orders/{id}/resends', () => {
  return cloud.post(test.api, payload2)
   .then(r => {
    orderId = r.body.id;
    externalRefId = r.body.externalRefID;
   })
  .then(r => cloud.withOptions({ qs: { where: `externalRefID='${externalRefId}'` } }).get(test.api))
  .then(r => {
   expect(r.body).to.not.be.empty;
   expect(r.body.length).to.equal(1);
   expect(r.body[0].externalRefID).to.equal(externalRefId);
 })
  .then(r => cloud.post(`${test.api}/${orderId}/resends`));
 });
});
