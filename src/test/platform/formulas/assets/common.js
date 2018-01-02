'use strict';

const cleaner = require('core/cleaner');
const tools = require('core/tools');
const b64 = tools.base64Encode;
const chakram = require('chakram');
const expect = chakram.expect;
const logger = require('winston');
const provisioner = require('core/provisioner');
const cloud = require('core/cloud');
const fSchema = require('./schemas/formula.schema');
const fiSchema = require('./schemas/formula.instance.schema');

const createFormula = (formula) => {
  return cleaner.formulas.withName(formula.name)
    .then(r => cloud.post('/formulas', formula, fSchema))
    .then(r => r.body);
};

const createFormulaFromFile = (file, name) => {
  const f = require(`./formulas/${file}`);

  return createFormula(f);
};
createFormula.fromFile = createFormulaFromFile;

const createFormulaInstance = (formulaId, formulaInstance) =>
  cloud.post(`/formulas/${formulaId}/instances`, formulaInstance, fiSchema)
    .then(r => r.body);

const createFormulaInstanceFromFile = (formulaId, file) => {
  const fi = require(`./formulas/${file}`);

  return createFormulaInstance(formulaId, fi);
};
createFormulaInstance.fromFile = createFormulaInstanceFromFile;

const getFormulaInstanceExecutions = (fiId) => cloud.get(`/formulas/instances/${fiId}/executions`);

const getFormulaInstanceExecution = (fieId) => cloud.get(`/formulas/instances/executions/${fieId}`);

const getFormulaInstanceExecutionWithSteps = (fieId) => {
  return getFormulaInstanceExecution(fieId)
    .then(r => {
      const fie = r.body;
      return cloud.withOptions({ qs: { includeValues: true } }).get(`/formulas/instances/executions/${fieId}/steps`)
        .then(r => fie.stepExecutions = r.body)
        .then(r => fie);
    });
};

const deleteFormula = (fId) => cloud.delete(`/formulas/${fId}`);
const deleteFormulaInstance = (fId, fiId) => cloud.delete(`/formulas/${fId}/instances/${fiId}`);

const genFormula = (opts) => new Object({
  name: (opts.name || 'churros-formula-name-' + tools.random())
});

const genTrigger = (opts) => new Object({
  type: (opts.type || 'scheduled'),
  properties: (opts.properties) || {
    cron: '0 0/15 * 1/1 * ? *'
  },
  onSuccess: (opts.onSuccess || null)
});

const genInstance = (opts) => new Object({
  name: (opts.name || 'churros-formula-instance-name')
});

const provisionSfdcWithPolling = () => provisioner.create('sfdc', {
  'event.notification.enabled': true,
  'event.vendor.type': 'polling',
  'event.poller.refresh_interval': 999999999
});

const provisionSfdcWithWebhook = () => provisioner.create('sfdc', {
  'event.notification.enabled': true,
  'event.vendor.type': 'webhook'
});

const generateSfdcEvent = (instanceId, payload) => {
  const url = `/events/sfdc`;
  const opts = { headers: { 'Element-Instances': instanceId } };
  return cloud
    .withOptions(opts)
    .post(url, payload);
};

const generateCloseioPollingEvent = (instanceId, payload) => {
  const headers = { 'Content-Type': 'application/json', 'Id': instanceId };
  const encodedId = b64(instanceId.toString());

  payload.instance_id = instanceId;

  return cloud
    .withOptions({ 'headers': headers })
    .post('/events/closeioPolling/' + encodedId, payload);
};

const generateSfdcPollingEvent = (instanceId, payload) => {
  const headers = { 'Content-Type': 'application/json', 'Id': instanceId };
  const encodedId = b64(instanceId.toString());

  payload.instance_id = instanceId;

  return cloud
    .withOptions({ 'headers': headers })
    .post('/events/closeioPolling/' + encodedId, payload);
};

const allExecutionsCompleted = (fId, fiId, numExecs, numExecVals) => () => new Promise((res, rej) => {
  return getFormulaInstanceExecutions(fiId)
    .then(r => {
      if (r.body.length !== numExecs) rej();

      return Promise.all(r.body.map(fie => getFormulaInstanceExecution(fie.id)))
        .then(rs => Promise.all(rs.map(r => r.body.stepExecutions)))
        .then(fieses => [].concat.apply([], fieses))
        .then(ses => {
          const numPending = ses.filter(se => se.status === 'pending').length;
          if (ses.length === (numExecVals * numExecs) && numPending === 0) {
            logger.debug(`All ${numExecs} executions completed with ${numExecVals} execution values for formula ${fId}, instance ${fiId}.`);
            res();
          } else {
            logger.debug(`Not all ${numExecs} executions completed with ${numExecVals} execution values for formula ${fId}, instance ${fiId}; ${ses.length} total execution values found so far.`);
            rej();
          }
        });
    });
});

/**
 * The default validator which applies to *every* single formula instance execution
 */
const defaultValidator = (executions, numEs, numSes, executionStatus) => {
  logger.debug('Validating executions with default validator');
  expect(executions).to.have.length(numEs);
  executions.map(e => {
    const eStatus = (executionStatus || 'success');
    expect(e.status).to.equal(eStatus);

    logger.debug('Validating step executions with default validator');
    expect(e.stepExecutions).to.have.length(numSes);
    e.stepExecutions.map(se => {
      expect(se).to.have.property('status');

      logger.debug('Validating step execution values with default validator');
      if (se.stepName === 'trigger') expect(se).to.have.property('status').and.equal('success');
    });
  });
};

const execValidatorWrapper = execValidator => (executions, numEs, numSes, executionStatus, fId, fiId) => {
  defaultValidator(executions, numEs, numSes, executionStatus);
  if (typeof execValidator === 'function') {
    return execValidator(executions, fId, fiId);
  }
  return executions;
};

/**
 * The test wrapper to wrap them all ...
 */
const testWrapper = (test, kickOffDatFormulaCb, f, fi, numEs, numSes, numSevs, execValidator, instanceValidator, executionStatus, numInstances) => {
  const fetchAndValidateExecutions = (fId, fiId) => () => new Promise((res, rej) => {
    return getFormulaInstanceExecutions(fiId)
    .then(r => Promise.all(r.body.map(fie => getFormulaInstanceExecutionWithSteps(fie.id))))
    .then(executions => execValidator(executions, numEs, numSes, executionStatus, fId, fiId))
    .then(v => res(v))
    .catch(e => rej(e));
  });

  const instanceValidatorWrapper = fId => {
    if (typeof instanceValidator === 'function') { return instanceValidator(fId); }
    return Promise.resolve(fId);
  };

  const fetchAndValidateInstances = fId => () => new Promise ((res, rej) => {
    instanceValidatorWrapper(fId)
    .then(v => res(v))
    .catch(e => rej(e));
  });

  let fId;
  const fiIds = [];
  return createFormula(f)
    .then(f => fId = f.id)
    .then(() => tools.times(numInstances || 1)(() => createFormulaInstance(fId, fi)))//cloud.post(`/formulas/${fId}/instances`, fi, fiSchema)))
    .then(ps => Promise.all(ps.map(p => {
      let fiId;
      return p
        .then(fi => {
          fiId = fi.id;
          fiIds.push(fiId);
        })
        .then(() => kickOffDatFormulaCb(fId, fiId))
        .then(() => tools.wait.upTo(120000).for(allExecutionsCompleted(fId, fiId, numEs, numSevs)))
        .then(() => tools.wait.upTo(120000).for(fetchAndValidateExecutions(fId, fiId)));
    })))
    .then(() => tools.wait.upTo(10000).for(fetchAndValidateInstances(fId)))
    .then(() => Promise.all(fiIds.map(fiId => deleteFormulaInstance(fId, fiId))))
    .then(() => deleteFormula(fId));
};

const getAllExecutions = (fiId, nextPage, all) => {
  all = all || [];
  const options = { qs: { nextPage: nextPage, pageSize: 200 } };
  return cloud.withOptions(options).get(`/formulas/instances/${fiId}/executions`)
    .then(r => {
      expect(r).to.have.statusCode(200);
      expect(r.body).to.not.be.null;
      all = all.concat(r.body);
      const npt = r.response.headers['elements-next-page-token'];
      return npt === undefined ? all : getAllExecutions(fiId, npt, all);
    })
    .catch(e => {
      logger.debug(`Failed to retrieve executions, returning current list.  Exception: ${e}`);
      return all;
    });
};

const createFAndFI = (element, config) => {
  element = element || 'closeio';
  let elementInstanceId, formulaId, formulaInstanceId;

  return createFormula.fromFile('simple-successful-formula')
    .then(f => formulaId = f.id)
    .then(r => provisioner.create(element, config))
    .then(r => elementInstanceId = r.body.id)
    .then(r => {
      const formulaInstance = require('./formulas/basic-formula-instance');
      formulaInstance.configuration.trigger_instance = elementInstanceId;
      return cloud.post(`/formulas/${formulaId}/instances`, formulaInstance, fiSchema);
    })
    .then(r => formulaInstanceId = r.body.id)
    .then(r => ({ formulaInstanceId: formulaInstanceId, formulaId: formulaId, elementInstanceId: elementInstanceId }));
};

const cleanup = (eiId, fId, fiId) => {
  return cloud.delete(`/formulas/${fId}/instances/${fiId}`)
    .then(r => cloud.delete(`/formulas/${fId}`))
    .then(r => eiId && provisioner.delete(eiId));
};

module.exports = {
  createFormula,
  createFormulaInstance,
  genFormula,
  genTrigger,
  genInstance,
  provisionSfdcWithPolling,
  provisionSfdcWithWebhook,
  generateSfdcEvent,
  generateSfdcPollingEvent,
  generateCloseioPollingEvent,
  defaultValidator,
  execValidatorWrapper,
  testWrapper,
  deleteFormula,
  deleteFormulaInstance,
  getAllExecutions,
  getFormulaInstanceExecutions,
  getFormulaInstanceExecutionWithSteps,
  createFAndFI,
  allExecutionsCompleted,
  cleanup
};
