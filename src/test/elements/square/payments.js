'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

suite.forElement('employee', 'locations', (test) => {
  // Using Cloud Elements business name as that's only one populated with sample payment data
  let locId, paymentId, business, businessName = 'Cloud Elements';
  before(() => cloud.get(test.api)
    .then(r => {
      business = r.body.filter(obj => obj['business_name'] && obj['business_name'] === businessName);
      expect(business).to.not.be.empty;
      locId = business[0].id;
    }));

  it(`should allow GET with where begin_time for ${test.api}/:id/payments`, () => {
    return cloud.withOptions({ qs: { where: "begin_time='2017-10-03T18:18:45Z'" } }).get(`${test.api}/${locId}/payments`)
      .then(r => expect(r.body.filter(obj => obj.created_at >= '2017-10-03T18:18:45Z')).to.not.be.null);
  });

  it(`should allow GET with where end_time for ${test.api}/:id/payments`, () => {
    return cloud.withOptions({ qs: { where: "end_time='2017-10-17T18:18:45Z'" } }).get(`${test.api}/${locId}/payments`)
      .then(r => expect(r.body.filter(obj => obj.created_at <= '2017-10-17T18:18:45Z')).to.not.be.null);
  });

  it(`should allow GET for ${test.api}/:id/payments/:paymentId`, () => {
    return cloud.get(`${test.api}/${locId}/payments`)
      .then(r => paymentId = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${locId}/payments/${paymentId}`));
  });
});
