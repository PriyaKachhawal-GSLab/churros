'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/orders.json`);
const payload2 = tools.requirePayload(`${__dirname}/assets/orders2.json`);
const cloud = require('core/cloud');
const expect = require('chakram').expect;

//Skipping the test since there are limits to the orders we can post and there are no delete API supported
suite.forElement('rewards', 'orders', { payload: payload, skip: true }, (test) => {
  test.should.supportCrs();
  test.should.supportPagination();
  it('should support C for orders/{id}/resends', () => {
    let orderId, externalRefId;
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
