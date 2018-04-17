'use strict';

const cleaner = require('core/cleaner');
const suite = require('core/suite');
const common = require('./assets/common');
const schema = require('./assets/schemas/formula.schema');
const fiSchema = require('./assets/schemas/formula.instance.schema');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

const opts = { name: 'formula instances', payload: common.genFormula({}), schema: schema };

suite.forPlatform('formulas', opts, (test) => {
  const setup = () => {
    return common.createFAndFI()
      .then(r => {
        return {
          formulaId: r.formulaId,
          formulaInstanceId: r.formulaInstanceId,
          elementInstanceId: r.elementInstanceId
        };
      });
  };

  const cleanup = (names) => {
    return cleaner.formulas.withName(names.concat('simple-successful'));
  };

  describe('general', () => {
    let elementInstanceId, formulaId, formulaInstanceId;
    before(() => {
      /* Create a formula instance to use in the tests below */
      return setup()
        .then(r => {
          formulaId = r.formulaId;
          formulaInstanceId = r.formulaInstanceId;
          elementInstanceId = r.elementInstanceId;
        });
    });

    after(() => {
      const formula = require('./assets/formulas/simple-successful-formula');
      return cleanup([formula.name]);
    });

    /* 200 on DELETE and PUT to /formulas/:id/instances/:id/active to activate and deactivate instance */
    it('should allow activating and deactivating formula instance', () => {
      const baseApi = `/formulas/${formulaId}/instances/${formulaInstanceId}`;
      const api = `${baseApi}/active`;
      return cloud.delete(api)
        .then(r => cloud.get(baseApi))
        .then(r => expect(r.body.active).to.equal(false))
        .then(r => cloud.put(api))
        .then(r => cloud.get(baseApi))
        .then(r => expect(r.body.active).to.equal(true));
    });

    it('should allow updating a formula instance', () => {
      const formulaInstance = require('./assets/formulas/basic-formula-instance');
      formulaInstance.configuration.trigger_instance = elementInstanceId;
      return cloud.put(`${test.api}/${formulaId}/instances/${formulaInstanceId}`, formulaInstance);
    });

    it('should sanitize formula instance tags on create and update', () => {
      const name = 'xss-instance';
      const updatedName = 'xss-instance-update';
      const formulaInstance = require('./assets/formulas/basic-formula-instance');

      let fiId;

      formulaInstance.name = `<a href="#" onClick="javascript:alert(\'xss\');return false;">@${name}</a>`;
      formulaInstance.configuration.trigger_instance = elementInstanceId;

      return common.createFormulaInstance(formulaId, formulaInstance)
        .then(fi => {
          fiId = fi.id;
          expect(fi.name).to.equal(`@${name}`);
          return fi;
        })
        .then(fi => {
          fi.name = `<a href="#" onClick="javascript:alert(\'xss\');return false;">@${updatedName}</a>`;
          return cloud.put(`${test.api}/${formulaId}/instances/${fiId}`, fi);
        })
        .then(r => expect(r.body.name).to.equal(`@${updatedName}`))
        .then(r => common.deleteFormulaInstance(formulaId, fiId))
        .catch(e => {
          if (formulaId && fiId) common.deleteFormulaInstance(formulaId, fiId);
          throw new Error(e);
        });
    });

    it('should allow CRUD a formula instance with notification settings', () => {
      const formulaInstance = require('./assets/formulas/basic-formula-instance');
      formulaInstance.configuration.trigger_instance = elementInstanceId;
      formulaInstance.settings = {
        'notification.email': 'churros+trash@cloud-elements.com',
        'notification.webhook.url': 'churrostrash.cloud-elements.com'
      };

      return cloud.get(`${test.api}/${formulaId}/instances/${formulaInstanceId}`)
        .then(r => {
          expect(r.body.settings['notification.email']).to.equal(undefined);
          expect(r.body.settings['notification.webhook.url']).to.equal(undefined);
        })
        .then(r => cloud.put(`${test.api}/${formulaId}/instances/${formulaInstanceId}`, formulaInstance))
        .then(r => {
          expect(r.body.settings['notification.email']).to.equal('churros+trash@cloud-elements.com');
          expect(r.body.settings['notification.webhook.url']).to.equal('churrostrash.cloud-elements.com');
        });
    });

    it('should search for formula instances by elementInstanceId', () => {
      const baseApi = '/formulas/instances';
      return cloud.withOptions({ qs:{ elementInstanceId: elementInstanceId } }).get(baseApi)
        .then(r => {
          expect(r.body.length).to.equal(1);
          expect(r.body[0].id).to.equal(formulaInstanceId);
        })
        .then(r => cloud.withOptions({ qs:{ elementInstanceId: -1 }}).get(baseApi))
        .then(r => expect(r.body.length).to.equal(0));
    });

    it('should support searchText', () => {
      return cloud.withOptions({ qs: { 'searchText': 'mula-inst' } }).get('formulas/instances')
        .then(r => {
          r.body.map(s => expect(s.name.includes('mula-inst')).to.equal(true));
        });
    });

    it('should support searchText with inactive', () => {
      return cloud.withOptions({ qs: { 'searchText': 'mula-inst', includeInactive: true } }).get('formulas/instances')
        .then(r => {
          r.body.map(s => expect(s.name.includes('mula-inst')).to.equal(true));
        });
    });

    /* 404 on PUT where formula and formula instance do not exist */
    test
      .withApi('/formulas/-1/instances/-1/active')
      .should.return404OnPut();

    /* 404 on DELETE where formula and formula instance do not exist */
    test
      .withApi('/formulas/-1/instances/-1/active')
      .should.return404OnDelete();
  });

  describe('scheduled', () => {
    let elementInstanceId, formulaId, formulaInstanceId;
    before(() => {
      /* Create a formula instance to use in the tests below */
      return setup()
        .then(r => {
          formulaId = r.formulaId;
          formulaInstanceId = r.formulaInstanceId;
          elementInstanceId = r.elementInstanceId;
        });
    });

    after(() => {
      const formula = require('./assets/formulas/simple-successful-scheduled-trigger-formula');
      return cleanup([formula.name]);
    });

    const fi = (cron, active) => ({
      name: 'churros-formula-instance',
      active: active,
      configuration: { cron: cron }
    });

    const description = (formulaId, formulaInstanceId) => `formula ${formulaId}, instance ${formulaInstanceId}`;

    it('should create a job for a new active formula and active instance triggered by schedule', () => {
      const formula = require('./assets/formulas/simple-successful-scheduled-trigger-formula');
      formula.active = true;

      return cleaner.formulas.withName(formula.name)
        .then(() => cloud.post(test.api, formula, schema))
        .then(r => formulaId = r.body.id)
        .then(() => cloud.post(`/formulas/${formulaId}/instances`, fi('0 0/60 * 1/1 * ? *', true), fiSchema))
        .then(r => formulaInstanceId = r.body.id)
        .then(() => cloud.get('/jobs'))
        .then(r => expect(r.body.filter(j => j.description.indexOf(description(formulaId, formulaInstanceId)) > -1)).to.have.length(1))
        .then(r => cleaner.formulas.withName(formula.name))
        .catch(e => {
          if (formula.name) cleaner.formulas.withName(formula.name);
          throw new Error(e);
        });
    });

    it('should not create a job for a new inactive formula and active instance triggered by schedule', () => {
      const formula = require('./assets/formulas/simple-successful-scheduled-trigger-formula');
      formula.active = false;

      return cleaner.formulas.withName(formula.name)
        .then(() => cloud.post(test.api, formula, schema))
        .then(r => formulaId = r.body.id)
        .then(() => cloud.post(`/formulas/${formulaId}/instances`, fi('0 0/60 * 1/1 * ? *', true), fiSchema))
        .then(r => formulaInstanceId = r.body.id)
        .then(r => cloud.get('/jobs'))
        .then(r => expect(r.body.filter(j => j.description.indexOf(description(formulaId, formulaInstanceId)) > -1)).to.be.empty)
        .then(r => cleaner.formulas.withName(formula.name))
        .catch(e => {
          if (formula.name) cleaner.formulas.withName(formula.name);
          throw new Error(e);
        });
    });

    it('should not create a job for a new active formula and inactive instance triggered by schedule', () => {
      const formula = require('./assets/formulas/simple-successful-scheduled-trigger-formula');
      formula.active = true;

      return cleaner.formulas.withName(formula.name)
        .then(() => cloud.post(test.api, formula, schema))
        .then(r => formulaId = r.body.id)
        .then(() => cloud.post(`/formulas/${formulaId}/instances`, fi('0 0/60 * 1/1 * ? *', false), fiSchema))
        .then(r => formulaInstanceId = r.body.id)
        .then(r => cloud.get('/jobs'))
        .then(r => expect(r.body.filter(j => j.description.indexOf(description(formulaId, formulaInstanceId)) > -1)).to.be.empty)
        .then(r => cleaner.formulas.withName(formula.name))
        .catch(e => {
          if (formula.name) cleaner.formulas.withName(formula.name);
          throw new Error(e);
        });
    });

    it('should create and delete jobs for a schedule triggered instance updated to active and inactive using the active endpoint', () => {
      const formula = require('./assets/formulas/simple-successful-scheduled-trigger-formula');

      return cleaner.formulas.withName(formula.name)
        .then(() => cloud.post(test.api, formula, schema))
        .then(r => formulaId = r.body.id)
        // create the formula instance (inactive)
        .then(() => cloud.post(`/formulas/${formulaId}/instances`, fi('0 0/60 * 1/1 * ? *', false), fiSchema))
        .then(r => formulaInstanceId = r.body.id)
        // check that there is no job for it
        .then(() => cloud.get('/jobs'))
        .then(r => expect(r.body.filter(j => j.description.indexOf(description(formulaId, formulaInstanceId)) > -1)).to.be.empty)
        // switch it to active
        .then(() => cloud.put(`/formulas/${formulaId}/instances/${formulaInstanceId}/active`))
        // check that there is now a job for it
        .then(() => cloud.get('/jobs'))
        .then(r => expect(r.body.filter(j => j.description.indexOf(description(formulaId, formulaInstanceId)) > -1)).to.have.length(1))
        // switch it to inactive
        .then(() => cloud.delete(`/formulas/${formulaId}/instances/${formulaInstanceId}/active`))
        // yep, you guessed it, check that there is no longer a job for it
        .then(() => cloud.get('/jobs'))
        .then(r => expect(r.body.filter(j => j.description.indexOf(description(formulaId, formulaInstanceId)) > -1)).to.be.empty)
        .then(r => cleaner.formulas.withName(formula.name))
        .catch(e => {
          if (formula.name) cleaner.formulas.withName(formula.name);
          throw new Error(e);
        });
    });

    it('should create and delete jobs for a schedule triggered instance updated to active and inactive using a PUT', () => {
      const formula = require('./assets/formulas/simple-successful-scheduled-trigger-formula');

      let instanceBody;
      return cleaner.formulas.withName(formula.name)
        .then(() => cloud.post(test.api, formula, schema))
        .then(r => formulaId = r.body.id)
        // create the formula instance (inactive)
        .then(() => cloud.post(`/formulas/${formulaId}/instances`, fi('0 0/60 * 1/1 * ? *', false), fiSchema))
        .then(r => {
          instanceBody = r.body;
          formulaInstanceId = r.body.id;
        })
        // check that there is no job for it
        .then(() => cloud.get('/jobs'))
        .then(r => expect(r.body.filter(j => j.description.indexOf(description(formulaId, formulaInstanceId)) > -1)).to.be.empty)
        // switch it to active
        .then(() => instanceBody.active = true)
        .then(() => cloud.put(`/formulas/${formulaId}/instances/${formulaInstanceId}`, instanceBody))
        .then(r => expect(r.body.active).to.equal(true))
        // check that there is now a job for it
        .then(r => cloud.get('/jobs'))
        .then(r => expect(r.body.filter(j => j.description.indexOf(description(formulaId, formulaInstanceId)) > -1)).to.have.length(1))
        // switch it to inactive
        .then(() => instanceBody.active = false)
        .then(() => cloud.put(`/formulas/${formulaId}/instances/${formulaInstanceId}`, instanceBody))
        .then(r => expect(r.body.active).to.equal(false))
        // yep, you guessed it, check that there is no longer a job for it
        .then(r => cloud.get('/jobs'))
        .then(r => expect(r.body.filter(j => j.description.indexOf(description(formulaId, formulaInstanceId)) > -1)).to.be.empty)
        .then(r => cleaner.formulas.withName(formula.name))
        .catch(e => {
          if (formula.name) cleaner.formulas.withName(formula.name);
          throw new Error(e);
        });
    });

    it('should create and delete jobs for a all schedule triggered instances with formula updated to active and inactive using a PUT', () => {
      const formula = require('./assets/formulas/simple-successful-scheduled-trigger-formula');
      formula.active = true;
      const formulaInstance = fi('0 0/60 * 1/1 * ? *', true);

      let formulaInstanceId2;
      return cleaner.formulas.withName(formula.name)
        .then(() => cloud.post(test.api, formula, schema))
        .then(r => formulaId = r.body.id)

      // create the first active formula instance
      .then(() => cloud.post(`/formulas/${formulaId}/instances`, formulaInstance, fiSchema))
        .then(r => formulaInstanceId = r.body.id)
        // check that there is a job for it
        .then(() => cloud.get('/jobs'))
        .then(r => expect(r.body.filter(j => j.description.indexOf(description(formulaId, formulaInstanceId)) > -1)).to.have.length(1))
        // create the second active formula instance
        .then(() => cloud.post(`/formulas/${formulaId}/instances`, formulaInstance, fiSchema))
        .then(r => formulaInstanceId2 = r.body.id)
        // check that there is a job for it
        .then(() => cloud.get('/jobs'))
        .then(r => expect(r.body.filter(j => j.description.indexOf(description(formulaId, formulaInstanceId)) > -1)).to.have.length(1))

      // switch formula to inactive
      .then(() => formula.active = false)
        .then(() => cloud.put(`/formulas/${formulaId}`, formula))
        .then(r => expect(r.body.active).to.equal(false))
        // check that there is no job for either instance
        .then(r => cloud.get('/jobs'))
        .then(r => {
          expect(r.body.filter(j => j.description.indexOf(description(formulaId, formulaInstanceId)) > -1)).to.be.empty;
          expect(r.body.filter(j => j.description.indexOf(description(formulaId, formulaInstanceId)) > -1)).to.be.empty;
        })

      // switch formula back to active
      .then(() => formula.active = true)
        .then(() => cloud.put(`/formulas/${formulaId}`, formula))
        .then(r => expect(r.body.active).to.equal(true))
        // yep, you guessed it, check that there are jobs for each instance
        .then(r => cloud.get('/jobs'))
        .then(r => {
          expect(r.body.filter(j => j.description.indexOf(description(formulaId, formulaInstanceId)) > -1)).to.have.length(1);
          expect(r.body.filter(j => j.description.indexOf(description(formulaId, formulaInstanceId)) > -1)).to.have.length(1);
        })
        .then(() => common.deleteFormulaInstance(formulaId, formulaInstanceId2))
        .then(r => cleaner.formulas.withName(formula.name))
        .catch(e => {
          if (formula.name) cleaner.formulas.withName(formula.name);
          throw new Error(e);
        });
    });

    it('should create and delete jobs for a all schedule triggered instances with formula trigger type switched to manual and back', () => {
      let formula = require('./assets/formulas/simple-successful-scheduled-trigger-formula');
      const cron = '0 0/60 * 1/1 * ? *';
      const formulaInstance = fi(cron, true);

      formula.active = true;

      return cleaner.formulas.withName(formula.name)
        .then(() => cloud.post(test.api, formula, schema))
        .then(r => {
          formula = r.body;
          formulaId = r.body.id;
        })

      // create the formula instance
      .then(() => cloud.post(`/formulas/${formulaId}/instances`, formulaInstance, fiSchema))
        .then(r => formulaInstanceId = r.body.id)
        // check that there is a job for it
        .then(() => cloud.get('/jobs'))
        .then(r => expect(r.body.filter(j => j.description.indexOf(description(formulaId, formulaInstanceId)) > -1)).to.have.length(1))

      // switch trigger type to manual
      .then(() => formula.triggers[0].type = 'manual')
        .then(() => cloud.put(`/formulas/${formulaId}`, formula))
        .then(r => {
          formula = r.body;
          expect(r.body.triggers[0].type).to.equal('manual');
        })
        // check that there is no longer a job for the instance
        .then(r => cloud.get('/jobs'))
        .then(r => {
          expect(r.body.filter(j => j.description.indexOf(description(formulaId, formulaInstanceId)) > -1)).to.be.empty;
        })

      // switch formula trigger back to scheduled
      .then(() => formula.triggers[0].type = 'scheduled')
        .then(() => formula.triggers[0].properties = { cron: cron })
        .then(() => cloud.put(`/formulas/${formulaId}`, formula))
        .then(r => expect(r.body.triggers[0].type).to.equal('scheduled'))
        // yep, you guessed it, check that the job has been created again
        .then(r => cloud.get('/jobs'))
        .then(r => {
          expect(r.body.filter(j => j.description.indexOf(description(formulaId, formulaInstanceId)) > -1)).to.have.length(1);
        })
        .then(r => cleaner.formulas.withName(formula.name))
        .catch(e => {
          if (formula.name) cleaner.formulas.withName(formula.name);
          throw new Error(e);
        });
    });
  });
});
