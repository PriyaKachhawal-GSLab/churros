const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

const manualFormulaTemplate = require('./assets/formulas/faar');
const manualFormulaTemplateRequestTest = require('./assets/formulas/faar-modified-request-key');

const setupManualFormula = (template) => Object.assign({}, template, {
  uri: '/churros-resource',
  method: 'POST',
});
const manualFormula = setupManualFormula(manualFormulaTemplate);

const manualFormulaForTriggerTest = setupManualFormula(manualFormulaTemplateRequestTest);

const manualTrigger = {
  request: {
    this:'that'
  }
};
const faarFormulaInstance = { name: 'faar-instance' };
const scheduledTrigger = {
  type: 'scheduled',
  onSuccess: manualFormula.triggers[0].onSuccess,
  properties: {
    cron: '0 0/60 * 1/1 * ? *',
  },
};

/**
 * Will cleanup the given formula and/or formula instance in the proper order
 */
const cleanup = (formulaId, formulaInstanceId) => {
  if (formulaInstanceId) {
    return cloud.delete(`/formulas/instances/${formulaInstanceId}`).then(() => cloud.delete(`/formulas/${formulaId}`));
  } else if (formulaId) {
    return cloud.delete(`/formulas/${formulaId}`);
  }
  return Promise.resolve();
};

suite.forPlatform('formulas', { name: 'FaaRs' }, test => {
  beforeEach(() => {
    const filter = name => name === manualFormula.name || name === manualFormulaForTriggerTest.name;
    return cloud
      .get('/formulas/instances')
      .then(r => Promise.all(r.body.filter(fi => filter(fi.formula.name)).map(fi => cleanup(fi.formula.id, fi.id))))
      .then(() => cloud.get('/formulas'))
      .then(r => Promise.all(r.body.filter(f => filter(f.name)).map(f => cleanup(f.id))));
  });

  const runFaarSetup = runCb => {
    let formula, formulaInstance;
    return cloud
      .post('/formulas', manualFormula)
      .then(r => (formula = r.body))
      .then(() => cloud.post(`/formulas/${formula.id}/instances`, faarFormulaInstance))
      .then(r => (formulaInstance = r.body))
      .then(r => runCb(formula, formulaInstance, manualFormula.uri))
      .then(() => cleanup(formula ? formula.id : null, formulaInstance ? formulaInstance.id : null))
      .catch(e => {
        return cleanup(formula ? formula.id : null, formulaInstance ? formulaInstance.id : null).then(() => {
          throw e;
        });
      });
  };

  it('should allow exposing a formula as a synchronous POST API resource', () => {
    const run = (formula, formulaInstance) => {
      const opts = { headers: { 'Elements-Formula-Instance-Id': formulaInstance.id } };
      return cloud.withOptions(opts).post(manualFormula.uri, { foo: 'bar' }).then(r => {
        expect(r.body).to.be.an('object');
        expect(Object.keys(r.body)).to.have.length.above(0);
        return r;
      });
    };

    return runFaarSetup(run);
  });

  it('should allow exposing a FaaR and then un-exposing it via PATCH /formulas', () => {
    const enableFaarBody = {
      method: 'GET',
      uri: '/churros-resource'
    };

    const disableFaarBody = {
      method: null,
      uri: null
    };

    const enableValidator = (formula) => {
      expect(formula.method).to.equal(enableFaarBody.method);
      expect(formula.uri).to.equal(enableFaarBody.uri);
    };

    const disableValidator = (formula) => {
      expect(formula.method).to.equal(undefined);
      expect(formula.uri).to.equal(undefined);
    };

    let formulaId;
    return cloud.post('/formulas', manualFormulaTemplate)
      .then(r => formulaId = r.body.id)
      .then(r => cloud.patch(`/formulas/${formulaId}`, enableFaarBody))
      .then(r => enableValidator(r.body))
      .then(r => cloud.patch(`/formulas/${formulaId}`, disableFaarBody))
      .then(r => disableValidator(r.body))
      .then(r => cloud.delete(`/formulas/${formulaId}`))
      .catch(e => {
        if (formulaId) cloud.delete(`/formulas/${formulaId}`);
        throw new Error(e);
      });
  });

  it('should not overwrite request key when formula is executed', () => {
    let formulaId, formulaInstanceId;
    const run = (formula, formulaInstance) => {
      const opts = { headers: { 'Elements-Formula-Instance-Id': formulaInstance} };
      return cloud.withOptions(opts).post(manualFormulaForTriggerTest.uri, manualTrigger).then(r => {
        expect(r.body).to.be.an('array');
        expect(r.body[3].trigger.args.request).to.have.property('this');
        return r;
      });
    };

    return cloud.post('/formulas', manualFormulaForTriggerTest)
      .then(r => formulaId = r.body.id)
      .then(r => cloud.post(`/formulas/${formulaId}/instances`, faarFormulaInstance))
      .then(r => formulaInstanceId = r.body.id)
      .then(r => run(formulaId, formulaInstanceId, manualFormulaForTriggerTest.uri))
      .then(r => cleanup(formulaId, formulaInstanceId));
  });

  it('should not allow exposing a formula that does not have a manual trigger', () => {
    const scheduledFormula = Object.assign({}, manualFormula, { triggers: [scheduledTrigger] });
    const v = r => expect(r).to.have.statusCode(400);
    return cloud.post(`/formulas`, scheduledFormula, v);
  });

  it('should not allow creating a formula if the API URI or method is set incorrectly', () => {
    const v = r => expect(r).to.have.statusCode(400);
    let formula;
    return cloud
      .post(`/formulas`, manualFormula)
      .then(r => (formula = r.body))
      .then(() => cloud.post(`/formulas/${formula.id}/instances`, { name: 'bad', settings: { api: '/bingo' } }, v))
      .then(() => cloud.post(`/formulas/${formula.id}/instances`, { name: 'bad', settings: { api: 'GET' } }, v))
      .then(() => cloud.post(`/formulas/${formula.id}/instances`, { name: 'bad', settings: { api: 'GET missing-a-slash' } }, v))
      .then(() => cloud.post(`/formulas/${formula.id}/instances`, { name: 'bad', settings: { api: 'GET /accounts' } }, v))
      .then(() => cloud.post(`/formulas/${formula.id}/instances`, { name: 'bad', settings: { api: 'GET /formulas/instances' } }, v));
  });

  it('should have API docs for a formula that is exposed as an API', () => {
    const run = (formula, formulaInstance) => {
      const v = ({body}) => {
        expect(body.paths).to.be.an('object');
        expect(Object.keys(body.paths)).to.have.length(1);
        // validate uri
        const uri = Object.keys(body.paths)[0];
        expect(uri).to.equal(manualFormula.uri);
        // validate HTTP method
        expect(Object.keys(body.paths[uri])).to.have.length(1);
        const method = Object.keys(body.paths[uri])[0];
        expect(method.toLowerCase()).to.equal(manualFormula.method.toLowerCase());
      };
      return cloud.get(`/formulas/${formula.id}/docs`, v);
    };

    return runFaarSetup(run);
  });
});
