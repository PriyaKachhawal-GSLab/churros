'use strict';

const provisioner = require('core/provisioner');
const tools = require('core/tools');
const suite = require('core/suite');
const cloud = require('core/cloud');
const cleaner = require('core/cleaner');
const chakram = require('chakram');
const expect = chakram.expect;
const schema = require('./assets/schemas/formula.schema');
const triggerSchema = require('./assets/schemas/formula.trigger.schema');
const instanceSchema = require('./assets/schemas/formula.instance.schema');
const common = require('./assets/common');
const props = require('core/props');
const logger = require('winston');

const opts = { payload: common.genFormula({}), schema: schema };

suite.forPlatform('formulas', opts, (test) => {

  test.should.supportCrud(chakram.put);

  it('should retrieve abridged payloads', () => {
    const f = common.genFormula({});
    f.steps = [{
      "name": "someApi",
      "type": "elementRequest",
      "properties": {
        "elementInstanceId": "${sfdc}",
        "api": "/hubs/crm/accounts",
        "method": "GET"
      }
    }];
    const validateResults = (formulaId, formulas) => {
      formulas.filter(formula => formula.id === formulaId).forEach(formula => {
          expect(formula).to.contain.key('name');
          expect(formula).to.contain.key('triggers');
          expect(formula).to.not.contain.key('steps');
      });
    };

    let formulaId;
    return cloud.post(test.api, f, schema)
      .then(r => formulaId = r.body.id)
      .then(r => cloud.withOptions({ qs: { abridged: true } }).get(test.api))
      .then(r => validateResults(formulaId, r.body))
      .then(() => cloud.delete(`/formulas/${formulaId}`));
  });

  it('should retrieve callable formulas', () => {
    const f = common.genFormula({});
    f.steps = [{
      "name": "someApi",
      "type": "elementRequest",
      "properties": {
        "elementInstanceId": "${sfdc}",
        "api": "/hubs/crm/accounts",
        "method": "GET"
      }
    }];
    const validateResults = (formulaId, r, fullResponse) => {
      expect(r.response.headers['elements-total-count']).to.be.below(fullResponse.response.headers['elements-total-count']);
      expect(r.response.headers['elements-returned-count']).to.be.below(fullResponse.response.headers['elements-returned-count']);
      cloud.delete(`/formulas/${formulaId}`);
      return false;
    };

    let formulaId;
    let fullResponse;
    return cloud.post(test.api, f, schema)
      .then(r => formulaId = r.body.id)
      .then(r => cloud.get(test.api))
      .then(r => fullResponse = r)
      .then(r => cloud.withOptions({ qs: { callableBy: formulaId } }).get(test.api))
      .then(r => validateResults(formulaId, r, fullResponse));
  });

    it('should allow adding and removing "scheduled" trigger to a formula', () => {
    const f = common.genFormula({});
    const t = common.genTrigger({});

    let formulaId;
    return cloud.post(test.api, f, schema)
      .then(r => formulaId = r.body.id)
      .then(r => cloud.post(`${test.api}/${formulaId}/triggers`, t, triggerSchema))
      .then(r => cloud.get(`${test.api}/${formulaId}/triggers/${r.body.id}`, triggerSchema))
      .then(r => cloud.delete(`/formulas/${formulaId}/triggers/${r.body.id}`))
      .then(r => cloud.delete(`/formulas/${formulaId}`));
  });

  it('should not allow creating a formula with an elementRequest step that calls a bulk download API', () => {
    let formulaId;
    const f = common.genFormula({});
    f.steps = [{
      "name": "bulk-download",
      "type": "elementRequest",
      "properties": {
        "elementInstanceId": "${sfdc}",
        "api": "/hubs/crm/bulk/123/contacts",
        "method": "GET"
      }
    }];
    return cloud.post(test.api, f, (r) => {
      expect(r).to.have.statusCode(400);
      cloud.delete(`${test.api}/${formulaId}`);
    });
  });

  it('should not allow an invalid cron for a "scheduled" trigger', () => {
    let formulaId;
    const f = common.genFormula({});
    const t = common.genTrigger({ properties: { cron: '0/30 * * 1/1 * ? *' } });
    return cloud.post(test.api, f, schema)
      .then(r => formulaId = r.body.id)
      .then(r => cloud.post(`${test.api}/${formulaId}/triggers`, t, (r) => expect(r).to.have.statusCode(400)))
      .then(r => cloud.delete(`${test.api}/${formulaId}`));
  });

  it('should not allow creating an instance of a formula with an invalid on success step', () => {
    const f = common.genFormula({});
    const fi = common.genInstance({});
    const t = common.genTrigger({ onSuccess: ['fake-step-name'] });

    let formulaId;
    return cloud.post(test.api, f, schema)
      .then(r => formulaId = r.body.id)
      .then(r => cloud.post(`${test.api}/${formulaId}/triggers`, t, triggerSchema))
      .then(r => cloud.post(`/formulas/${formulaId}/instances`, fi, (r) => expect(r).to.have.statusCode(400)))
      .then(r => cloud.delete(`/formulas/${formulaId}`))
      .catch(e => {
        if (formulaId) cloud.delete(`/formulas/${formulaId}`);
        throw new Error(e);
      });
  });

  it('should allow creating a big azz formula and then an instance', () => {
    const genF = () => {
      let f = require('./assets/formulas/big-formula.json');
      f.name = tools.random();
      return f;
    };

    const genFi = (id) => {
      let fi = require('./assets/formulas/big-formula-instance.json');
      fi.configuration['sfdc.instance.id'] = id;
      fi.configuration['sailthru.instance.id'] = id;
      return fi;
    };

    let id, formulaId;
    return provisioner.create('jira')
      .then(r => id = r.body.id)
      .then(r => cloud.post(test.api, genF(), schema))
      .then(r => formulaId = r.body.id)
      .then(r => cloud.post(`/formulas/${formulaId}/instances`, genFi(id), instanceSchema))
      .then(r => cloud.delete(`/formulas/${formulaId}/instances/${r.body.id}`, formulaId, r.body.id))
      .then(r => cloud.delete(`/formulas/${formulaId}`))
      .then(r => provisioner.delete(id))
      .catch(e => {
        if (formulaId && id) {
          cloud.delete(`/formulas/${formulaId}`);
          provisioner.delete(id);
        }
        throw new Error(e);
      });
  });

  it('should allow exporting a formula', () => {
    const f = common.genFormula({});
    let formulaId;
    return cloud.post(test.api, f, schema)
      .then(r => formulaId = r.body.id)
      .then(r => cloud.get(`${test.api}/${formulaId}/export`))
      .then(r => expect(r.body.name).to.equal(f.name))
      .then(r => cloud.delete(`${test.api}/${formulaId}`))
      .catch(e => {
        if (formulaId) cloud.delete(`${test.api}/${formulaId}`);
        throw new Error(e);
      });
  });

  it('should allow PATCHing a formula', () => {
    const f = common.genFormula({});
    const patchBody = {
      name: `updated-name-${tools.random()}`,
      active: false,
      description: 'updated-description'
    };

    const validator = (formula) => {
      expect(formula.name).to.equal(patchBody.name);
      expect(formula.active).to.equal(patchBody.active);
      expect(formula.description).to.equal(patchBody.description);
    };

    let formulaId;
    return cloud.post(test.api, f, schema)
      .then(r => formulaId = r.body.id)
      .then(r => cloud.patch(`${test.api}/${formulaId}`, patchBody))
      .then(r => validator(r.body))
      .then(r => cloud.delete(`${test.api}/${formulaId}`))
      .catch(e => {
        if (formulaId) cloud.delete(`${test.api}/${formulaId}`);
        throw new Error(e);
      });
  });

  it('should allow setting the engine flag to v3 for a compatible a formula', () => {
    const f = common.genFormula({});
    const patchBody = {
      engine: 'v3',
    };

    const validator = (formula) => {
      expect(formula.engine).to.equal(patchBody.engine);
    };

    let formulaId;
    return cloud.post(test.api, f, schema)
      .then(r => formulaId = r.body.id)
      .then(r => cloud.patch(`${test.api}/${formulaId}`, patchBody))
      .then(r => validator(r.body))
      .then(r => cloud.delete(`${test.api}/${formulaId}`))
      .catch(e => {
        if (formulaId) cloud.delete(`${test.api}/${formulaId}`);
        throw new Error(e);
      });
  });

  it('should not allow setting the engine flag to v3 for a formula with unsupported steps', () => {
    const f = common.genFormula({});
    f.steps = [{
      "name": "unsupported-by-bode",
      "type": "java",
      "properties": {
      }
    }];
    f.engine = 'v3';

    return cloud.post(test.api, f, (r) => {
      expect(r).to.have.statusCode(400);
      expect(r.body.message).to.contain('Invalid formula for the v3 engine');
    });
  });

  it('should allow upgrading a formula to v3 and reverting it back to v1', () => {
    const genF = () => {
      let f = require('./assets/formulas/complex-to-upgrade.json');
      f.name = tools.random();
      return f;
    };

    const validatorUpdate = (formula) => {
      expect(formula.engine).to.equal('v3');

      const looper = formula.steps.filter(s => s.name === 'looper')[0];
      expect(looper.properties.list).to.equal('${steps.ten_ids_please.ids}');

      const invalid = formula.steps.filter(s => s.name === 'invalid_request_step')[0];
      expect(invalid.properties.api).to.equal('/nosuchresource/${steps.get_contacts.response[0].id}');

      const get = formula.steps.filter(s => s.name === 'get_contacts')[0];
      expect(get.properties.elementInstanceId).to.equal('${config.trigger_instance}');

      const retrieve = formula.steps.filter(s => s.name === 'retrieve_contact')[0];
      expect(retrieve.properties.api).to.equal('/hubs/crm/contacts/${steps.looper.entry}');
      expect(retrieve.properties.path).to.equal(undefined);      
    };

    const validatorRollback = (formula) => {
      expect(formula.engine).to.not.equal('v3');

      const looper = formula.steps.filter(s => s.name === 'looper')[0];
      expect(looper.properties.list).to.equal('ten_ids_please.ids');

      const invalid = formula.steps.filter(s => s.name === 'invalid_request_step')[0];
      expect(invalid.properties.api).to.equal('/nosuchresource/${get_contacts.response[0].id}');

      const get = formula.steps.filter(s => s.name === 'get_contacts')[0];
      expect(get.properties.elementInstanceId).to.equal('${trigger_instance}');

      const retrieve = formula.steps.filter(s => s.name === 'retrieve_contact')[0];
      expect(retrieve.properties.api).to.equal('/hubs/crm/contacts/{entry}');
      expect(retrieve.properties.path).to.equal('${looper}');
    };

    let formulaId;
    return cloud.post(test.api, genF(), schema)
      .then(r => formulaId = r.body.id)
      .then(r => cloud.put(`${test.api}/${formulaId}/upgrade/v3`))
      .then(r => validatorUpdate(r.body))
      .then(r => cloud.delete(`${test.api}/${formulaId}/upgrade/v3`))
      .then(r => validatorRollback(r.body))
      .then(r => cloud.delete(`${test.api}/${formulaId}`))
      .catch(e => {
        if (formulaId) cloud.delete(`${test.api}/${formulaId}`);
        throw new Error(e);
      });
  });

  test
    .withApi(test.api + '/-1/export')
    .should.return404OnGet();

  it('should allow monitoring and un-monitoring a formula', () => {
    if (props.get('user') !== 'system') {
      logger.warn("Can only run these tests as system user");
      return;
    }

    const f = common.genFormula({});

    let formulaId;
    return cloud.post(test.api, f, schema)
      .then(r => formulaId = r.body.id)
      .then(r => cloud.put(`${test.api}/${formulaId}/monitored`, {}))
      .then(r => cloud.delete(`${test.api}/${formulaId}/monitored`, {}))
      .then(r => cloud.delete(`${test.api}/${formulaId}`))
      .catch(e => {
        if (formulaId) {
          cloud.delete(`${test.api}/${formulaId}/monitored`, {});
          cloud.delete(`${test.api}/${formulaId}`);
        }
        throw new Error(e);
      });
  });

  it('should sanitize formula name on create and update', () => {
    const name = `churros-xss`;
    const putName = `churros-xss-put`;
    const patchName = `churros-xss-patch`;
    const f = common.genFormula({ name: `<a href="#" onClick="javascript:alert(\'xss\');return false;">${name}</a>` });
    let formulaId;
    return cleaner.formulas.withName([name, putName, patchName])
      .then(() => common.createFormula(f, `<a href="#" onClick="javascript:alert(\'xss\');return false;">${name}</a>`))
      .then(f => formulaId = f.id)
      .then(() => cloud.get(`${test.api}/${formulaId}`))
      .then(r => expect(r.body.name).to.equal(name))
      .then(() => cloud.put(`${test.api}/${formulaId}`, { name: `<a href="#" onClick="javascript:alert(\'xss\');return false;">${putName}</a>` }))
      .then(r => expect(r.body.name).to.equal(putName))
      .then(() => cloud.patch(`${test.api}/${formulaId}`, { name: `<a href="#" onClick="javascript:alert(\'xss\');return false;">${patchName}</a>` }))
      .then(r => expect(r.body.name).to.equal(patchName))
      .then(() => cloud.delete(`${test.api}/${formulaId}`))
      .catch(e => {
        if (formulaId) cloud.delete(`${test.api}/${formulaId}`);
        throw new Error(e);
      });
  });
});
