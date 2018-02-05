'use strict';

const cleaner = require('core/cleaner');
const suite = require('core/suite');
const common = require('./assets/common');
const {createXInstances, genCloseioAccountEvent, genWebhookEvent, pollAllExecutions, simulateTrigger} = require('./assets/load-common');
const cloud = require('core/cloud');
const fSchema = require('./assets/schemas/formula.schema');
const chakram = require('chakram');
const provisioner = require('core/provisioner');

/**
 * Tests formula executions under heavy load (number of events, size of events, etc.)
 */
suite.forPlatform('formulas', { name: 'formulas load', skip: true }, (test) => {
  let sfdcId, closeioId;

  const numFormulaInstances = process.env.NUM_FORMULA_INSTANCES ? process.env.NUM_FORMULA_INSTANCES : 1;
  const numEvents = process.env.NUM_EVENTS ? process.env.NUM_EVENTS : 1;
  const numInOneEvent = process.env.NUM_OBJECTS_PER_EVENT ? process.env.NUM_OBJECTS_PER_EVENT : 1;

  before(() => cleaner.formulas.withName('complex_successful')
    .then(() => cleaner.formulas.withName('number2'))
    .then(() => cleaner.formulas.withName('complex_starwars_sucessful'))
    .then(r => common.provisionSfdcWithWebhook())
    .then(r => sfdcId = r.body.id)
    .then(r => provisioner.create('closeio', { 'event.notification.enabled': true, 'event.vendor.type': 'polling', 'event.poller.refresh_interval': 999999999 }))
    .then(r => closeioId = r.body.id));

  /** Clean up */
  after(() => {
    if (sfdcId) provisioner.delete(sfdcId);
    if (closeioId) provisioner.delete(closeioId);
  });

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
      .then(r => simulateTrigger(numEvents, closeioId, genCloseioAccountEvent('update', numInOneEvent), common.generateCloseioPollingEvent))
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
      .then(r => simulateTrigger(numEvents, closeioId, genCloseioAccountEvent('update', numInOneEvent), common.generateCloseioPollingEvent))
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
      .then(r => simulateTrigger(numEvents, closeioId, genCloseioAccountEvent('update', numInOneEvent), common.generateCloseioPollingEvent))
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
});
