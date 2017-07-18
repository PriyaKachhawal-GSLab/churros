'use strict';

const common = require('./common');
const expect = require('chakram').expect;
const cloud = require('core/cloud');
const tools = require('core/tools');
const props = require('core/props');
const logger = require('winston');
const provisioner = require('core/provisioner');
const suite = require('core/suite');
const dispositionsSchema = require('./assets/dispositions.schema.json');
const formula = require('./assets/formula');
const cleaner = require('core/cleaner');

const signatureKey = '1234efgh5678dcba';

suite.forPlatform('events', { name: 'event disposition' }, (test) => {
  let instanceId, formulaId, formulaInstanceId;
  const element = props.getForKey('events', 'element');

  before(() => {
    return provisioner.create(element, common.gen({}, props.getForKey('events', 'url'), signatureKey))
    .then(r => instanceId = r.body.id)
    .then(() => cleaner.formulas.withName(formula.name))
    .then(() => cloud.post('/formulas', formula))
    .then(r => formulaId = r.body.id)
    .then(r => cloud.post(`/formulas/${formulaId}/instances`, { name: 'tmp' , configuration: {element: instanceId}}))
    .then(r => formulaInstanceId = r.body.id);
  });


  after(() => {
    return cloud.delete(`/formulas/${formulaId}/instances/${formulaInstanceId}`)
      .then(() => `/formulas/${formulaId}`)
      .then(() => provisioner.delete(instanceId));
  });

  it('should include information on webhooks and formula executions', () => {
    const payload = common.loadEventRequest(element);
    const load = props.getForKey('events', 'load');

    return cloud.createEvents(element, { '<elementInstanceId>': instanceId }, payload, load)
      .then(sentEvents => sentEvents.filter(event => event.error).length)
      .then(f => { if (f > 0) logger.warn("Failed to POST %d events", f); })
      .then(() => tools.wait.upTo(10000).for(() => cloud.get(`instances/events/dispositions`, dispositionsSchema)))
      .then(() => {
      })
      // Wait up to 10 seconds to see if we've gotten all events in the analytics results.
      .then(r => tools.wait.upTo(90000).for(() => {
        const from = new Date();
        from.setHours(from.getHours() - 1);
        const to = new Date();
        return cloud.get(`/instances/events/dispositions?from=${from.toJSON()}&to=${to.toJSON()}&interval=minute`)
          .then(r => {
            expect(r.body.length).to.not.equal(0);
            expect(r.body).to.satisfy(events =>
              events.find(event =>
                event.notificationData && event.notificationData.find(notification =>
                  notification.message.includes('Error delivering event'))));
            expect(r.body).to.satisfy(events =>
              events.find(event =>
                event.notificationData && event.notificationData.find(notification =>
                  notification.message.includes('Triggered executions'))));
            expect(r.body).to.satisfy(events =>
              events.find(event =>
                event.notificationData && event.notificationData.find(notification =>
                  notification.message.includes('Completed execution'))));
          });
      }));
  });

});
