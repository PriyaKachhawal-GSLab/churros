'use strict';

const cloud = require('core/cloud');
const cleaner = require('core/cleaner');
const common = require('./assets/common');
const expect = require('chakram').expect;
const invalid = require('./assets/formulas/formula-with-invalid-configs');
const suite = require('core/suite');
const schema = require('./assets/schemas/formula.schema');
const tools = require('core/tools');

suite.forPlatform('formulas', { name: 'formula config', schema: schema }, (test) => {
  before(() => cleaner.formulas.withName([invalid.name, 'complex_successful']));
  after(() => cleaner.formulas.withName([invalid.name, 'complex_successful']));

  /* make sure config keys are being validated properly when creating a formula with config */
  test
    .withName('should not allow creating a formula with two configs that have the same key')
    .withJson(invalid)
    .should.return409OnPost();

  it('should not allow adding a config to a formula with the same key as an already existing config', () => {
    const config = { name: 'Bob the builder', key: 'yes.he.can', type: 'value' };
    const validator = (r) => expect(r).to.have.statusCode(409);

    let formulaId;
    return cloud.post(test.api, common.genFormula({}))
      .then(r => formulaId = r.body.id)
      .then(r => cloud.post(`${test.api}/${formulaId}/configuration`, config))
      .then(r => cloud.post(`${test.api}/${formulaId}/configuration`, config, validator))
      .then(r => cloud.delete(`${test.api}/${formulaId}`))
      .catch(e => {
        if (formulaId) cloud.delete(`${test.api}/${formulaId}`);
        throw new Error(e);
      });
  });

  /**
   * Creates a formula with a trigger and steps that rely on a given variable.  Then, update that variable and the
   * trigger and steps that were relying on it should also be updated properly
   */
  it('should allow updating a variable key and all relying steps/triggers will be updated too', () => {
    const f = tools.copyAsset(require.resolve('./assets/formulas/complex-successful-formula'));
    const v = (r, key) => {
      expect(r).to.have.statusCode(200);
      expect(r.body).to.not.be.null;
      // make sure it replaces one without the config. prefix
      expect(r.body.triggers[0].properties.elementInstanceId).to.equal(`\${${key}}`);
      // make sure it replaces also with the config. prefix
      r.body.steps.filter((s) => s.properties.elementInstanceId !== undefined).forEach(rs => expect(rs.properties.elementInstanceId).to.equal(`\${config.${key}}`));
      return r;
    };

    const validateCreate = (r) => v(r, 'trigger_instance');

    const validateUpdate = (r) => v(r, 'sfdc.instance');

    const parseConfig = (formula) => formula.configuration.filter((c) => c.key === 'trigger_instance')[0];

    const parseConfigId = (formula) => parseConfig(formula).id;

    const genConfig = (formula) => {
      const c = parseConfig(formula);
      c.key = 'sfdc.instance';
      c.name = 'SFDC Instance';
      return c;
    };

    let formulaId, formulaConfigId;
    return cloud.post(test.api, f, validateCreate)
      .then(r => {
        formulaId = r.body.id;
        formulaConfigId = parseConfigId(r.body);
        return r;
      })
      .then(r => cloud.put(`${test.api}/${formulaId}/configuration/${formulaConfigId}`, genConfig(f)))
      .then(r => cloud.get(`${test.api}/${formulaId}`, validateUpdate))
      .then(r => cloud.delete(`${test.api}/${formulaId}`))
      .catch(e => {
        if (formulaId) cloud.delete(`${test.api}/${formulaId}`);
        throw new Error(e);
      });
  });
});
