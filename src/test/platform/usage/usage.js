'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const cloud = require('core/cloud');
const moment = require('moment');
const provisioner = require('core/provisioner');
const tools = require('core/tools');
const usageSchema = require('./assets/usage.schema');
const analyticsSchema = require('./assets/analytics.schema');

suite.forPlatform('usage', { schema: usageSchema }, (test) => {
  let yestermonth, today, futureToday, futureTomorrow, instanceId, requestId;
  before(done => {
    // create closeio instance and make API call to populate usage, just in case
    today = moment().format('YYYY[-]MM[-]DD');
    yestermonth = moment().subtract(30, 'days').format('YYYY[-]MM[-]DD');
    futureToday = moment().add(1, 'days').format('YYYY[-]MM[-]DD');
    futureTomorrow = moment().add(2, 'days').format('YYYY[-]MM[-]DD');
    // create a closeio instance and make a request to populate usage
    provisioner.create('closeio')
      .then(r => instanceId = r.body.id)
      .then(() => cloud.withOptions({ qs: { pageSize: 1 } }).get('/hubs/crm/accounts'))
      .then(r => requestId = r.response.headers['elements-request-id'])
      .then(() => tools.wait.upTo(10000).for(() => {
        return cloud.get(`usage/${requestId}`)
          .then(r => expect(r.body).is.not.empty);
      }))
      .then(() => done())
      .catch(() => done());
  });

  after(done => {
    provisioner.delete(instanceId)
      .then(r => done());
  });

  it('should support usage retrieve', () => {
    return cloud.get(`usage/${requestId}`);
  });

  it('should support usage retrieve and search', () => {
    let trafficId;
    return cloud.get('usage', usageSchema)
      .then(r => trafficId = r.body[ 0 ].traffic_id)
      .then(r => cloud.withOptions({ qs: { from: yestermonth, to: futureToday, hub: 'crm', 'keys[]': 'closeio', 'tags[]': 'churros-instance', status: 'success', searchText: 'AccountId' } }).get('usage', usageSchema))
      .then(r => cloud.get(`usage/${trafficId}`));
  });

  it('should support offset pagination', () => {
    return cloud.withOptions({ qs: { pageSize: 1 } }).get('usage', usageSchema)
      .then(r => cloud.withOptions({ qs: { pageSize: 1, pageOffset: 1 } }).get('usage', usageSchema));
  });

  it('should support token pagination', () => {
    return cloud.withOptions({ qs: { pageSize: 1 } }).get('usage', usageSchema)
      .then(r => cloud.withOptions({ qs: { nextPage: r.response.headers[ 'elements-next-page-token' ] } }).get('usage'), usageSchema);
  });

  it('should support response time analytics', () => cloud.withOptions({ qs: { from: yestermonth, to: today } }).get('usage/analytics/times', analyticsSchema));

  it('should support status analytics', () => cloud.withOptions({ qs: { from: yestermonth, to: today } }).get('usage/analytics/statuses', analyticsSchema));

  it('usage APIs should return 404 for future date', () => {
    const expectFoHunderdNFer = (r) => {
      expect(r.response.statusCode).to.equal(404);
    };

    return cloud.withOptions({ qs: { from: futureToday, to: futureTomorrow } }).get('usage', expectFoHunderdNFer)
      .then(() => cloud.withOptions({ qs: { from: futureToday, to: futureTomorrow } }).get('usage/analytics/times', expectFoHunderdNFer))
      .then(() => cloud.withOptions({ qs: { from: futureToday, to: futureTomorrow } }).get('usage/analytics/statuses', expectFoHunderdNFer));
  });

  it('usage APIs should return empty list if no logs found', () => {
    const expectEmptyArray = (r) => {
      expect(r.body.usage.length).to.equal(0);
    };

    const expectZero = (r) => {
      expect(r.body.instancesCreatedCount).to.equal(0);
    };

    return cloud.withOptions({ qs: { from: futureToday, to: futureTomorrow } }).get('usage/analytics/activity/element-instances', expectEmptyArray)
    .then(r => cloud.withOptions({ qs: { from: futureToday, to: futureTomorrow } }).get('usage/analytics/activity/formula-instances', expectEmptyArray))
    .then(r => cloud.withOptions({ qs: { from: futureToday, to: futureTomorrow } }).get('usage/analytics/activity/element-instances/created-count', expectZero))
    .then(r => cloud.withOptions({ qs: { from: futureToday, to: futureTomorrow } }).get('usage/analytics/activity/formula-instances/created-count', expectZero));
  });

});
