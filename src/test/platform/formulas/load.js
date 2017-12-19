'use strict';

const cleaner = require('core/cleaner');
const suite = require('core/suite');
const common = require('./assets/common');
const cloud = require('core/cloud');
const fSchema = require('./assets/schemas/formula.schema');
const fiSchema = require('./assets/schemas/formula.instance.schema');
const chakram = require('chakram');
const expect = chakram.expect;
const logger = require('winston');
const provisioner = require('core/provisioner');

const genCloseioEvent = (action, num) => {
  const event = require('./assets/events/raw-closeio-account-obj');
  const events = [];
  for (let i = 0; i < num; i++) {
    events.push(event);
  }
  return { objectType: 'accounts', accounts: events };
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

/**
 * Tests formula executions under heavy load (number of events, size of events, etc.)
 */
suite.forPlatform('formulas', { name: 'formulas load', skip: true }, (test) => {
  let sfdcId, closeioId, kissmetricsId;

  before(() => cleaner.formulas.withName('complex_successful')
    .then(() => cleaner.formulas.withName('number2'))
    .then(() => cleaner.formulas.withName('complex_starwars_sucessful'))
    .then(() => cleaner.formulas.withName('Kissmetrics Events/Props'))
    .then(() => cleaner.formulas.withName('Nintex 790 - Load Test'))
    .then(r => common.provisionSfdcWithWebhook())
    .then(r => sfdcId = r.body.id)
    .then(r => provisioner.create('kissmetrics'))
    .then(r => kissmetricsId = r.body.id)
    .then(r => provisioner.create('closeio', { 'event.notification.enabled': true, 'event.vendor.type': 'polling', 'event.poller.refresh_interval': 999999999 }))
    .then(r => closeioId = r.body.id));

  /** Clean up */
  after(() => {
    if (sfdcId) provisioner.delete(sfdcId);
    if (closeioId) provisioner.delete(closeioId);
    if (kissmetricsId) provisioner.delete(closeioId);
  });

    const numFormulaInstances = process.env.NUM_FORMULA_INSTANCES ? process.env.NUM_FORMULA_INSTANCES : 1;
    const numEvents = process.env.NUM_EVENTS ? process.env.NUM_EVENTS : 1;
    const numInOneEvent = process.env.NUM_OBJECTS_PER_EVENT ? process.env.NUM_OBJECTS_PER_EVENT : 1;

  it('should handle a very large event payload repeatedly using sfdc', () => {
    const formula = require('./assets/formulas/complex-successful-formula');
    formula.engine = process.env.CHURROS_FORMULAS_ENGINE;
    const formulaInstance = require('./assets/formulas/basic-formula-instance');
    formulaInstance.configuration.trigger_instance = sfdcId;

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
      .then(r => common.deleteFormula(formulaId))
      .catch(e => {
        if (formulaId) common.deleteFormula(formulaId);
        throw new Error(e);
      });
  });

  it('should handle a very large event payload repeatedly using closeio', () => {
    const formula = require('./assets/formulas/complex-successful-formula');
    formula.engine = process.env.CHURROS_FORMULAS_ENGINE;
    const formulaInstance = require('./assets/formulas/basic-formula-instance');
    formulaInstance.configuration.trigger_instance = closeioId;

    let formulaId;
    let formulaInstances = [];
    let deletes = [];
    return cloud.post(test.api, formula, fSchema)
      .then(r => formulaId = r.body.id)
      .then(() => createXInstances(numFormulaInstances, formulaId, formulaInstance))
      .then(ids => ids.map(id => formulaInstances.push(id)))
      .then(r => simulateTrigger(numEvents, closeioId, genCloseioEvent('update', numInOneEvent), common.generateCloseioPollingEvent))
      .then(r => pollAllExecutions(formulaId, formulaInstances, numInOneEvent * numEvents, 1))
      .then(r => formulaInstances.forEach(id => deletes.push(cloud.delete(`/formulas/${formulaId}/instances/${id}`))))
      .then(r => chakram.all(deletes))
      .then(r => common.deleteFormula(formulaId))
      .catch(e => {
        if (formulaId) common.deleteFormula(formulaId);
        throw new Error(e);
      });
  });


  it('should handle a very large number of executions making httpRequests', () => {
    const formula = require('./assets/formulas/complex-starwars-successful');
    formula.engine = process.env.CHURROS_FORMULAS_ENGINE;
    const formulaInstance = require('./assets/formulas/basic-formula-instance');
    formulaInstance.configuration.trigger_instance = closeioId;

    let formulaId;
    let formulaInstances = [];
    let deletes = [];
    return cloud.post(test.api, formula, fSchema)
      .then(r => formulaId = r.body.id)
      .then(() => createXInstances(numFormulaInstances, formulaId, formulaInstance))
      .then(ids => ids.map(id => formulaInstances.push(id)))
      .then(r => simulateTrigger(numEvents, closeioId, genCloseioEvent('update', numInOneEvent), common.generateCloseioPollingEvent))
      .then(r => pollAllExecutions(formulaId, formulaInstances, numInOneEvent * numEvents, 1))
      .then(r => formulaInstances.forEach(id => deletes.push(cloud.delete(`/formulas/${formulaId}/instances/${id}`))))
      .then(r => chakram.all(deletes))
      .then(r => common.deleteFormula(formulaId))
      .catch(e => {
        if (formulaId) common.deleteFormula(formulaId);
        throw new Error(e);
      });
  });

  it('should handle a very large number of executions using v1 and v3 engine at the same time', () => {
    const formula = require('./assets/formulas/complex-successful-formula');
    formula.engine = 'v1';

    const formulaInstance = require('./assets/formulas/basic-formula-instance');
    formulaInstance.configuration.trigger_instance = closeioId;

    let formulaId, formulaId2;
    let formulaInstances = [];
    let deletes = [];
    return cloud.post(test.api, formula, fSchema)
      .then(r => formulaId = r.body.id)
      .then(() => createXInstances(numFormulaInstances, formulaId, formulaInstance))
      .then(ids => ids.map(id => formulaInstances.push(id)))
      .then(() => {
        formula.name = 'number2';
        formula.engine = 'v3';
        return cloud.post(test.api, formula, fSchema);
      })
      .then(r => formulaId2 = r.body.id)
      .then(() => createXInstances(numFormulaInstances, formulaId2, formulaInstance))
      .then(ids => ids.map(id => formulaInstances.push(id)))
      .then(r => simulateTrigger(numEvents, closeioId, genCloseioEvent('update', numInOneEvent), common.generateCloseioPollingEvent))
      .then(r => pollAllExecutions(formulaId, formulaInstances, numInOneEvent * numEvents, 1))
      .then(r => formulaInstances.forEach(id => deletes.push(cloud.delete(`/formulas/instances/${id}`))))
      .then(r => chakram.all(deletes))
      .then(r => common.deleteFormula(formulaId))
      .then(r => common.deleteFormula(formulaId2))
      .catch(e => {
        if (formulaId) common.deleteFormula(formulaId);
        if (formulaId2) common.deleteFormula(formulaId2);
        throw new Error(e);
      });
  });

  it('should handle a high load for the KissMetrics Events/Props formula', () => {
    const formula = require('./assets/formulas/customer-formulas/kissmetrics');
    formula.engine = process.env.CHURROS_FORMULAS_ENGINE;
    const formulaInstance = require('./assets/formulas/customer-formulas/kissmetrics-instance');
    formulaInstance.configuration.sourceInstanceId = sfdcId;
    formulaInstance.configuration.kissmetricsInstanceId = kissmetricsId;

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
      .then(r => common.deleteFormula(formulaId))
      .catch(e => {
        if (formulaId) common.deleteFormula(formulaId);
        throw new Error(e);
    });
  });

  it('should handle a high load for the Nintex Event Transformation formula', () => {
    const formula = require('./assets/formulas/customer-formulas/nintex-790');
    formula.engine = process.env.CHURROS_FORMULAS_ENGINE;
    const formulaInstance = require('./assets/formulas/customer-formulas/nintex-790-instance');
    formulaInstance.configuration["element.instance"] = sfdcId;
    formulaInstance.configuration["event.notification.url"] = "https://httpbin.org/post";

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
      .then(r => common.deleteFormula(formulaId))
      .catch(e => {
        if (formulaId) common.deleteFormula(formulaId);
        throw new Error(e);
    });
  });
});
