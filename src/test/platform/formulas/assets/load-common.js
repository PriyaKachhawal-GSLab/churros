'use strict';

const cloud = require('core/cloud');
const common = require('./common');
const chakram = require('chakram');
const expect = chakram.expect;
const logger = require('winston');
const fiSchema = require('./schemas/formula.instance.schema');
  
const genCloseioEvent = (action, num) => {
  const event = require('./events/raw-webhook');
  const events = [];
  for (let i = 0; i < num; i++) {
    events.push(event);
  }
  return { action: action, objects: events };
};

const genWebhookEvent = (action, num) => {
  const event = require('./events/raw-webhook');
  const events = [];
  for (let i = 0; i < num; i++) {
    events.push(event);
  }
  return { action: action, objects: events };
};

const genCaseWebhookEvent = (action, num) => {
  const event = require('./events/raw-case-webhook');
  const events = [];
  for (let i = 0; i < num; i++) {
    events.push(event);
  }
  return { action: action, objects: events };
};

const simulateTrigger = (num, instanceId, payload, simulateCb) => {
  const all = [];
  for (let i = 0; i < num; i++) {
    all.push(simulateCb(instanceId, payload));
  }
  return chakram.all(all);
};

const pollExecutions = (formulaId, formulaInstanceId, numExpected, attemptNum) => {
  return new Promise((res, rej) => {
    return common.getAllExecutions(formulaInstanceId)
      .then(executions => {
        let status = {
          started: executions.length,
          success: executions.filter(e => e.status === 'success').length,
          failed: executions.filter(e => e.status === 'failed').length,
          pending: executions.filter(e => e.status === 'pending').length
        };
        if (status.success + status.failed < numExpected) {
          if (attemptNum > 500) {
            throw Error(`Attempt limit of 100 exceeded, quitting`);
          }

          logger.debug(`Formula ${formulaId} instance ${formulaInstanceId}: Attempt ${attemptNum}: ${status.started} started, ${status.pending} pending, ${status.success} success, ${status.failed} failed`);
          // pause this formula instance's polling for a bit
          setTimeout(() => {
            return pollExecutions(formulaId, formulaInstanceId, numExpected, attemptNum + 1)
              .then(s => res(s));
          }, 10000);
        } else {
          logger.debug(`Formula ${formulaId} instance ${formulaInstanceId}: All ${numExpected} executions finished. ${status.success} success, ${status.failed} failed`);
          return res(status);
        }
      });
  });
};

const pollAllExecutions = (formulaId, formulaInstanceIds, numExpected, attemptNum) => {
  const execs = [];
  formulaInstanceIds.forEach(id => execs.push(pollExecutions(formulaId, id, numExpected, attemptNum)));
  return chakram.all(execs)
    .then(es => {
      es.forEach(ex => expect(ex.failed).to.equal(0));
    });
};

const createXInstances = (x, formulaId, formulaInstance) => {
  const ids = [];
  return cloud.post(`/formulas/${formulaId}/instances`, formulaInstance, fiSchema)
    .then(r => {
      expect(r).to.have.statusCode(200);
      ids.push(r.body.id);
      const all = [];
      for (let i = 0; i < x - 1; i++) {
        all.push(cloud.post(`/formulas/${formulaId}/instances`, formulaInstance, fiSchema));
      }
      return chakram.all(all);
    })
    .then(rs => {
      rs.map(r => ids.push(r.body.id));
      return ids;
    });
};

module.exports = {
  createXInstances,
  genCloseioEvent,
  genCaseWebhookEvent,
  genWebhookEvent,
  pollAllExecutions,
  simulateTrigger
};