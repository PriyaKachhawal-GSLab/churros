'use strict';

const cleaner = require('core/cleaner');
const suite = require('core/suite');
const common = require('./assets/common');
const {createXInstances, genCaseWebhookEvent, genWebhookEvent, pollAllExecutions, simulateTrigger} = require('./assets/load-common');
const cloud = require('core/cloud');
const fSchema = require('./assets/schemas/formula.schema');
const chakram = require('chakram');
const expect = chakram.expect;
const provisioner = require('core/provisioner');
const tools = require('core/tools');

/**
 * Tests customer formula executions. Tests under heavy load (number of events, size of events, etc.) when applicable.
 */
suite.forPlatform('formulas', { name: 'customer-formulas', skip: false }, (test) => {
  let sfdcId, kissmetricsId, lithiumId, fbLeadAdsId, sailthruId;

  const numFormulaInstances = process.env.NUM_FORMULA_INSTANCES ? process.env.NUM_FORMULA_INSTANCES : 1;
  const numEvents = process.env.NUM_EVENTS ? process.env.NUM_EVENTS : 1;
  const numInOneEvent = process.env.NUM_OBJECTS_PER_EVENT ? process.env.NUM_OBJECTS_PER_EVENT : 1;

  before(() => cleaner.formulas.withName('Kissmetrics Events/Props')
    .then(() => cleaner.formulas.withName('Nintex 790 - Load Test'))
    .then(() => cleaner.formulas.withName('Lithium - Ticket Status'))
    .then(() => cleaner.formulas.withName('bulk1sfdc'))
    .then(() => cleaner.formulas.withName('bulk2sfdc'))
    .then(r => common.provisionSfdcWithWebhook())
    .then(r => sfdcId = r.body.id)
    .then(r => provisioner.create('kissmetrics'))
    .then(r => kissmetricsId = r.body.id)
    .then(r => provisioner.create('lithiumlsw'))
    .then(r => lithiumId = r.body.id)
    .then(r => provisioner.create('sailthru'))
    .then(r => sailthruId = r.body.id)
    .then(r => provisioner.create('facebookleadads'))
    .then(r => fbLeadAdsId = r.body.id));

  /** Clean up */
  after(() => {
    if (sfdcId) provisioner.delete(sfdcId);
    if (kissmetricsId) provisioner.delete(kissmetricsId);
    if (lithiumId) provisioner.delete(lithiumId);
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

  it('should handle a high load for the Lithium Ticket Status formula', () => {
    const formula = require('./assets/formulas/customer-formulas/lithium-sfdc-ticket-status');
    formula.engine = process.env.CHURROS_FORMULAS_ENGINE;
    const formulaInstance = require('./assets/formulas/customer-formulas/lithium-ticket-instance');
    formulaInstance.configuration['sfdc.instance.id'] = sfdcId;
    formulaInstance.configuration['lithiumlsw.instance.id'] = lithiumId;

    let formulaId;
    let formulaInstances = [];
    let deletes = [];
    return cloud.post(test.api, formula, fSchema)
      .then(r => formulaId = r.body.id)
      .then(() => createXInstances(numFormulaInstances, formulaId, formulaInstance))
      .then(ids => ids.map(id => formulaInstances.push(id)))
      .then(r => simulateTrigger(numEvents, sfdcId, genCaseWebhookEvent('update', numInOneEvent), common.generateSfdcEvent))
      .then(r => pollAllExecutions(formulaId, formulaInstances, numInOneEvent * numEvents, 1))
      .then(r => formulaInstances.forEach(id => deletes.push(cloud.delete(`/formulas/${formulaId}/instances/${id}`))))
      .then(r => chakram.all(deletes))
      .then(r => common.deleteFormula(formulaId))
      .catch(e => {
        if (formulaId) common.deleteFormula(formulaId);
        throw new Error(e);
    });
  });

  it('should run the Lithium Sfdc bulk formulas', () => {
    const formula1 = require('./assets/formulas/customer-formulas/lithium-sfdc-bulk1');
    formula1.engine = process.env.CHURROS_FORMULAS_ENGINE;
    const formulaInstance1 = require('./assets/formulas/customer-formulas/lithium-sfdc-bulk1-instance');
    formulaInstance1.configuration['sfdc.instance.id'] = sfdcId;

    const formula2 = require('./assets/formulas/customer-formulas/lithium-sfdc-bulk2');
    formula2.engine = process.env.CHURROS_FORMULAS_ENGINE;
    const formulaInstance2 = require('./assets/formulas/customer-formulas/lithium-sfdc-bulk2-instance');
    formulaInstance2.configuration['sfdc.instance.id'] = sfdcId;
    formulaInstance2.configuration['lithiumlsw.instance.id'] = lithiumId;

    let formula1Id, formula2Id, fi1Id, fi2Id;
    return cloud.post(test.api, formula2, fSchema)
      .then(r => formula2Id = r.body.id)
      .then(() => cloud.post(`${test.api}/${formula2Id}/instances`, formulaInstance2))
      .then(r => {
        fi2Id = r.body.id;
        formulaInstance1.configuration.formulainstanceid = r.body.id;
      })
      .then(() => cloud.post(test.api, formula1, fSchema))
      .then(r => formula1Id = r.body.id)
      .then(() => cloud.post(`${test.api}/${formula1Id}/instances`, formulaInstance1))
      .then(r => fi1Id = r.body.id)

      // kick off formula 1 (the bulk job callback kicks off formula 2)
      .then(() => cloud.post(`${test.api}/${formula1Id}/instances/${fi1Id}/executions`, {}))
      // verify both 1 and 2 have 1 successful execution
      .then(r => tools.wait.upTo(60000).for(() => cloud.get(`${test.api}/instances/${fi1Id}/executions`, r => {
        expect(r.body).to.have.length(1);
        expect(r.body[0].status).to.equal('success');
      })))
      .then(r => tools.wait.upTo(180000).for(() => cloud.get(`${test.api}/instances/${fi2Id}/executions`, r => {
        expect(r.body).to.have.length(1);
        expect(r.body[0].status).to.equal('success');
      })))
      .then(r => common.deleteFormula(formula1Id))
      .then(r => common.deleteFormula(formula2Id))
      .then(r => common.deleteFormulaInstance(fi1Id))
      .then(r => common.deleteFormula(fi2Id))
      .catch(e => {
        if (formula1Id) common.deleteFormula(formula1Id);
        if (formula2Id) common.deleteFormula(formula2Id);
        throw new Error(e);
    });
  });

  it('should handle a high load for the Sailthru Facebook Lead Ads formula', () => {
    const formula = require('./assets/formulas/customer-formulas/sailthru');
    formula.engine = process.env.CHURROS_FORMULAS_ENGINE;
    const formulaInstance = require('./assets/formulas/customer-formulas/sailthru-instance');
    formulaInstance.configuration['facebookleadads.instance.id'] = fbLeadAdsId;
    formulaInstance.configuration['sailthru.instance.id'] = sailthruId;

    let formulaId;
    let formulaInstances = [];
    let deletes = [];
    return cloud.post(test.api, formula, fSchema)
      .then(r => formulaId = r.body.id)
      .then(() => createXInstances(numFormulaInstances, formulaId, formulaInstance))
      .then(ids => ids.map(id => formulaInstances.push(id)))
      .then(r => simulateTrigger(numEvents, sfdcId, genCaseWebhookEvent('update', numInOneEvent), common.generateSfdcEvent))
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
