'use strict';

const common = require('./common');
const expect = require('chakram').expect;
const cloud = require('core/cloud');
const tools = require('core/tools');
const props = require('core/props');
const logger = require('winston');
const provisioner = require('core/provisioner');
const suite = require('core/suite');
const analyticsSchema = require('./assets/analytics.schema.json');
const instanceAnalyticsSchema = require('./assets/instanceAnalytics.schema.json');
const accountAnalyticsSchema = require('./assets/accountAnalytics.schema.json');

const signatureKey = '1234efgh5678dcba';

suite.forPlatform('events', { name: 'event analytics' }, (test) => {
  if (props.get('url').indexOf('snapshot') < 0 && props.get('url').indexOf('staging') < 0 && props.get('url').indexOf('production') < 0) {
    logger.warn('Unable to run formula analytics locally. Skipping.');
    return;
  }

  let instanceId;
  const element = props.getForKey('events', 'element');
  before(done => provisioner.create(element, common.gen({}, props.getForKey('events', 'url'), signatureKey))
    .then(r => instanceId = r.body.id)
    .then(r => done()));

  after(done => provisioner.delete(instanceId)
    .then(r => done()));

    it('should return analytics for x events for an element instance', () => {
      const payload = common.loadEventRequest(element);
      const load = props.getForKey('events', 'load');

      return cloud.createEvents(element, { '<elementInstanceId>': instanceId }, payload, load)
        .then(sentEvents => sentEvents.filter(event => event.error).length)
        .then(f => { if (f > 0) logger.warn("Failed to POST %d events", f); })
        .then(() => tools.wait.upTo(10000).for(() => cloud.get(`instances/events/analytics`, analyticsSchema)))
        // Wait up to 10 seconds to see if we've gotten all events in the analytics results.
        .then(r => tools.wait.upTo(90000).for(() => {
          const from = new Date();
          from.setHours(from.getHours() - 1);
          const to = new Date();
          return cloud.get(`/instances/events/analytics?from=${from.toJSON()}&to=${to.toJSON()}&interval=minute`)
            .then(r => expect(r.body).to.have.length(61) && expect(r.body.reduce((accum, curr) => accum + curr.count, 0)).to.be.at.least(load));
        }));
    });

    it('should return an error for an invalid date range for event analytics', () => {
      const from = new Date();
      from.setHours(from.getHours() - 1);
      const to = new Date();
      to.setHours(to.getHours() - 2);
      return cloud.get(`/instances/events/analytics?from=${from.toJSON()}&to=${to.toJSON()}&interval=minute`, r => expect(r).to.have.statusCode(400))
        .then(r => expect(r.body).to.contain.all.keys(['requestId', 'message']));
    });

    it('should return an error for an invalid interval for event analytics', () => {
      const from = new Date();
      from.setHours(from.getHours() - 24);
      const to = new Date();
      return cloud.get(`/instances/events/analytics?from=${from.toJSON()}&to=${to.toJSON()}&interval=second`, r => expect(r).to.have.statusCode(400))
        .then(r => expect(r.body).to.contain.all.keys(['requestId', 'message']));
    });

    it('should return an error for an invalid account ID for event analytics', () =>
      cloud.get(`/instances/events/analytics?accountIds[]=0`, r => expect(r).to.have.statusCode(403))
        .then(r => expect(r.body).to.contain.all.keys(['requestId', 'message']))
    );

    it('should return instance analytics for x events for an element instance', () => {
      const payload = common.loadEventRequest(element);
      const load = props.getForKey('events', 'load');

      return cloud.createEvents(element, { '<elementInstanceId>': instanceId }, payload, load)
        .then(sentEvents => sentEvents.filter(event => event.error).length)
        .then(f => { if (f > 0) logger.warn("Failed to POST %d events", f); })
        .then(() => tools.wait.upTo(10000).for(() => cloud.get(`instances/events/analytics/instances`, instanceAnalyticsSchema)))
        .then(() => {
        })
        // Wait up to 10 seconds to see if we've gotten all events in the instance analytics results.
        .then(r => tools.wait.upTo(90000).for(() => {
          const from = new Date();
          from.setHours(from.getHours() - 1);
          const to = new Date();
          return cloud.get(`/instances/events/analytics/instances?from=${from.toJSON()}&to=${to.toJSON()}&interval=minute`)
            .then(r =>
              expect(r.body).to.have.length(61) &&
                r.body.map(s => expect(s).to.have.contain.keys(['records', 'total', 'timestamp'])) &&
                expect(r.body.reduce((accum, curr) =>
                  accum + (curr.records[0] ? curr.records.reduce((a, c) => a + c.count, 0) : 0), 0)).to.be.at.least(load)
            );
        }));
    });

    it('should return an error for an invalid date range for event instance analytics', () => {
      const from = new Date();
      from.setHours(from.getHours() - 1);
      const to = new Date();
      to.setHours(to.getHours() - 2);
      return cloud.get(`/instances/events/analytics/instances?from=${from.toJSON()}&to=${to.toJSON()}&interval=minute`, r => expect(r).to.have.statusCode(400))
        .then(r => expect(r.body).to.contain.all.keys(['requestId', 'message']));
    });

    it('should return an error for an invalid interval for instance analytics', () => {
      const from = new Date();
      from.setHours(from.getHours() - 24);
      const to = new Date();
      return cloud.get(`/instances/events/analytics/instances?from=${from.toJSON()}&to=${to.toJSON()}&interval=second`, r => expect(r).to.have.statusCode(400))
        .then(r => expect(r.body).to.contain.all.keys(['requestId', 'message']));
    });

    it('should return an error for an invalid account ID for instance analytics', () =>
      cloud.get(`/instances/events/analytics/instances?accountIds[]=0`, r => expect(r).to.have.statusCode(403))
        .then(r => expect(r.body).to.contain.all.keys(['requestId', 'message']))
    );

    it('should return account analytics for x events for an element instance', () => {
      const payload = common.loadEventRequest(element);
      const load = props.getForKey('events', 'load');

      return cloud.createEvents(element, { '<elementInstanceId>': instanceId }, payload, load)
        .then(sentEvents => sentEvents.filter(event => event.error).length)
        .then(f => { if (f > 0) logger.warn("Failed to POST %d events", f); })
        .then(() => tools.wait.upTo(10000).for(() => cloud.get(`instances/events/analytics/accounts`, accountAnalyticsSchema)))
        .then(() => {
        })
        // Wait up to 10 seconds to see if we've gotten all events in the account analytics results.
        .then(r => tools.wait.upTo(90000).for(() => {
          const from = new Date();
          from.setHours(from.getHours() - 1);
          const to = new Date();
          return cloud.get(`/instances/events/analytics/accounts?from=${from.toJSON()}&to=${to.toJSON()}&interval=minute`)
            .then(r =>
              expect(r.body).to.have.length(61) &&
                r.body.map(s => expect(s).to.have.contain.keys(['records', 'total', 'timestamp'])) &&
                expect(r.body.reduce((accum, curr) =>
                  accum + (curr.records[0] ? curr.records.reduce((a, c) => a + c.count, 0) : 0), 0)).to.be.at.least(load)
            );
        }));
    });

    it('should return an error for an invalid date range for event account analytics', () => {
      const from = new Date();
      from.setHours(from.getHours() - 1);
      const to = new Date();
      to.setHours(to.getHours() - 2);
      return cloud.get(`/instances/events/analytics/accounts?from=${from.toJSON()}&to=${to.toJSON()}&interval=minute`, r => expect(r).to.have.statusCode(400))
        .then(r => expect(r.body).to.contain.all.keys(['requestId', 'message']));
    });

    it('should return an error for an invalid interval for account analytics', () => {
      const from = new Date();
      from.setHours(from.getHours() - 24);
      const to = new Date();
      return cloud.get(`/instances/events/analytics/accounts?from=${from.toJSON()}&to=${to.toJSON()}&interval=second`, r => expect(r).to.have.statusCode(400))
        .then(r => expect(r.body).to.contain.all.keys(['requestId', 'message']));
    });

    it('should return an error for an invalid account ID for account analytics', () =>
      cloud.get(`/instances/events/analytics/accounts?accountIds[]=0`, r => expect(r).to.have.statusCode(403))
        .then(r => expect(r.body).to.contain.all.keys(['requestId', 'message']))
    );
});
