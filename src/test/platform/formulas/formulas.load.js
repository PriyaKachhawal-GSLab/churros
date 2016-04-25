'use strict';

const suite = require('core/suite');
const common = require('./assets/common');
const cloud = require('core/cloud');
const fSchema = require('./assets/schemas/formula.schema');
const fiSchema = require('./assets/schemas/formula.instance.schema');
const chakram = require('chakram');
const expect = chakram.expect;
const logger = require('winston');
const tools = require('core/tools');

/**
 * {
 *   "objectType": type,
 *   "instance_id": elementInstanceId,
 *   type: [
 *     {
 *       objects
 *     }
 *   ]
 * }
 */
const genPollingEvent = (instanceId, type, num) => {
  const event = require('./assets/events/large-event');
  const events = [];
  for (let i = 0; i < num; i++) {
    events.push(event);
  }
  return { objectType: type, instance_id: instanceId, type: events };
};

const genWebhookEvent = (action, num) => {
  const event = require('./assets/events/raw-webhook');
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
    return common.getAllExecutions(formulaId, formulaInstanceId)
      .then(executions => {
        let status = {
          started: executions.length,
          success: executions.filter(e => e.status === 'success').length,
          failed: executions.filter(e => e.status === 'failed').length,
          pending: executions.filter(e => e.status === 'pending').length
        };
        if (status.success + status.failed < numExpected) {
          if (attemptNum > 100) {
            throw Error(`Attempt limit of 100 exceeded, quitting`);
          }

          logger.debug(`Formula ${formulaId} instance ${formulaInstanceId}: Attempt ${attemptNum}: ${status.started} started, ${status.pending} pending, ${status.success} success, ${status.failed} failed`);
          // pause this formula instance's polling for a bit
          setTimeout(() => {
            return pollExecutions(formulaId, formulaInstanceId, numExpected, attemptNum + 1)
              .then(s => res(s));
          }, 5000);
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

/**
 * Tests formula executions under heavy load (number of events, size of events, etc.)
 */
suite.forPlatform('formulas', { name: 'formulas load' }, (test) => {
  let sfdcId;
  before(() => common.deleteFormulasByName(test.api, 'complex-successful')
    .then(r => common.provisionSfdcWithWebhook())
    .then(r => sfdcId = r.body.id));

  /** Clean up */
  after(() => {
    // if (sfdcId) return provisioner.delete(sfdcId);
  });

  it('should handle a very large event payload repeatedly', () => {
    const formula = require('./assets/complex-successful-formula');
    const formulaInstance = require('./assets/complex-successful-formula-instance');
    formulaInstance.configuration[ 'trigger-instance' ] = sfdcId;

    const numFormulaInstances = 2;
    const numEvents = 5;
    const numInOneEvent = 1;

    let formulaId;
    let formulaInstances = [];
    let deletes = [];
    return cloud.post(test.api, formula, fSchema)
      .then(r => formulaId = r.body.id)
      .then(() => createXInstances(numFormulaInstances, formulaId, formulaInstance))
      .then(ids => ids.map(id => formulaInstances.push(id)))
      .then(r => simulateTrigger(numEvents, sfdcId, genWebhookEvent('update', numInOneEvent), common.generateSfdcEvent))
      .then(r => pollAllExecutions(formulaId, formulaInstances, numInOneEvent * numEvents, 1))
      .then(r => formulaInstances.forEach(id => deletes.push(cloud.delete(`/formulas/${formulaId}/instances/${id}`))))
      .then(r => chakram.all(deletes))
      .then(r => common.deleteFormula(formulaId));
  });
});
