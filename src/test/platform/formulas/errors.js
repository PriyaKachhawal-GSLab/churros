'use strict';

const common = require('./assets/common');
const expect = require('chakram').expect;
const cloud = require('core/cloud');
const tools = require('core/tools');
const suite = require('core/suite');

const defaultValidator = (executions, numEs, numSes, executionStatus) => {
  expect(executions).to.have.length(numEs);
  executions.map(e => {
    expect(e.stepExecutions).to.have.length(numSes);
    e.stepExecutions.map(se => {
      expect(se).to.have.property('status');

      if (se.stepName === 'trigger') {
        expect(se).to.have.property('status').and.equal('success');
        if (se.stepExecutionValues[0].value.includes('bar')) {
          expect(e).to.have.property('status').and.equal('failed');
        }
      }
    });
  });
};

const defaultTriggerCb = numEs => (fId, fiId) =>
  Promise.all(tools.times(numEs)(index => {
    return cloud.post(`/formulas/${fId}/instances/${fiId}/executions`, { foo: `${(index + 1) % numEs === 0 ? 'baz' : 'bar'}` });
  }));

suite.forPlatform('formulas', { name: 'formula errors' }, (test) => {

  /**
   * Handles the basic formula execution test for a formula that has a manual trigger type
   */
  const testIt = (fName, configuration, numEs, numSevs, execValidator, instanceValidator, executionStatus, numInstances, triggerCb) => {
    const f = require(`./assets/formulas/${fName}`);
    f.engine = process.env.CHURROS_FORMULAS_ENGINE;
    let fi = { name: 'churros-manual-formula-instance' };

    if (configuration) {
      fi.configuration = configuration;
    }

    const execValidatorWrapper = (executions, numEs, numSes, executionStatus, fId, fiId) => {
      defaultValidator(executions, numEs, numSes, executionStatus);
      executions.map(e => {
        e.stepExecutions.filter(se => se.stepName === 'trigger')
          .map(t => {
            expect(t.stepExecutionValues.length).to.equal(1);
            const sev = t.stepExecutionValues[0];
            expect(sev).to.have.property('key').and.equal('trigger.args');
          });
      });
      if (typeof execValidator === 'function') return execValidator(executions, fId, fiId);
      return executions;
    };

    const instanceValidatorWrapper = fId => {
      if (typeof instanceValidator === 'function') return instanceValidator(fId);
      return Promise.resolve(true);
    };

    const numSes = f.steps.length + 1; // steps + trigger
    return common.testWrapper(test, triggerCb || defaultTriggerCb(numEs), f, fi, numEs, numSes, numSevs, execValidatorWrapper, instanceValidatorWrapper, executionStatus, numInstances || 1);
  };

  it('should return the error for a failed execution', () => {
    const execValidator = (executions, fId, fiId) => {

      return Promise.all(executions.map(e => {
        cloud.get(`/formulas/instances/executions/${e.id}/errors`)
          .then(r => {
            expect(r.body).to.have.lengthOf(1);
            r.body.map(e => {
              expect(e.status).to.equal('failed');
              expect(e.stepExecutionValues).to.have.lengthOf(1);
            });
          });
      }));
    };

    return testIt('simple-error-formula-manual-v2', {}, 4, 3, execValidator, null, 'failed', 1);
  });

  it('should return 3 executions with errors for 3 failed and one non-failed executions', () => {
    const execValidator = (executions, fId, fiId) => {
      let first;

      // Get all 3 executions, each with errors
      return cloud.get(`/formulas/instances/${fiId}/executions/errors`)
        .then(r => {
          expect(r.body).to.have.lengthOf(3);
          r.body.map(e => {
            expect(e.status).to.equal('failed');
            expect(e.stepExecutions).to.have.lengthOf(1);
            expect(e.stepExecutions[0].status).to.equal('failed');
          });
        })
        // Get just the first page with page size 1
        .then(() => cloud.get(`/formulas/instances/${fiId}/executions/errors?pageSize=2`))
        .then(r => {
          expect(r.body).to.have.length.of.at.least(1);
          expect(r).to.have.header('Elements-Next-Page-Token');
          first = r.body[0].id;
          return r.response.headers['elements-next-page-token'];
        })
        // Get page 2 with page size 1 and make sure it's not the same ID as page 1
        .then(np => cloud.get(`/formulas/instances/${fiId}/executions/errors?pageSize=2&nextPage=${np}`))
        .then(r => {
          expect(r.body).to.have.length.of.at.least(1);
          expect(r.body[0].id).to.not.equal(first);
        })
        // Get the errors by date (1 hour ago to 1 hour in the future), which should have all 3 instances
        .then(np => {
          const from = new Date();
          from.setHours(from.getHours() - 1);
          const to = new Date();
          to.setHours(to.getHours() + 1);

          return cloud.get(`/formulas/instances/${fiId}/executions/errors?from=${from.toJSON()}&to=${to.toJSON()}`);
        })
        .then(r => expect(r.body).to.have.lengthOf(3))
        // Get the errors by date (1 to 2 hours in the future), which should return an empty array
        .then(np => {
          const from = new Date();
          from.setHours(from.getHours() + 1);
          const to = new Date();
          to.setHours(to.getHours() + 2);

          return cloud.get(`/formulas/instances/${fiId}/executions/errors?from=${from.toJSON()}&to=${to.toJSON()}`);
        })
        .then(r => expect(r.body).to.have.lengthOf(0));
    };

    return testIt('simple-error-formula-manual-v2', {}, 4, 3, execValidator, null, 'failed', 1);
  });

  it('should return 3 instances with 3 executions with errors for 9 failed executions', () => {
    const instanceValidator = fId => {
      let first;

      // Get all 3 instances with 3 executions, each with errors
      return cloud.get(`/formulas/${fId}/instances/executions/errors`)
        .then(r => {
          expect(r.body).to.have.lengthOf(3);
          r.body.map(i => {
            expect(i.executions).to.have.lengthOf(3);
            expect(i.executions[0].status).to.equal('failed');
            expect(i.executions[0].stepExecutions).to.have.lengthOf(1);
            expect(i.executions[0].stepExecutions[0].status).to.equal('failed');
          });
        })
        // Get just the first page with page size 1
        .then(() => cloud.get(`/formulas/${fId}/instances/executions/errors?pageSize=1`))
        .then(r => {
          expect(r.body).to.have.lengthOf(1);
          expect(r).to.have.header('Elements-Next-Page-Token');
          first = r.body[0].id;
          return r.response.headers['elements-next-page-token'];
        })
        // Get page 2 with page size 1 and make sure it's not the same ID as page 1
        .then(np => cloud.get(`/formulas/${fId}/instances/executions/errors?pageSize=1&nextPage=${np}`))
        .then(r => {
          expect(r.body).to.have.lengthOf(1);
          expect(r.body[0].id).to.not.equal(first);
        })
        // Get the errors by date (1 hour ago to 1 hour in the future), which should have all 3 instances
        .then(() => {
          const from = new Date();
          from.setHours(from.getHours() - 1);
          const to = new Date();
          to.setHours(to.getHours() + 1);

          return cloud.get(`/formulas/${fId}/instances/executions/errors?from=${from.toJSON()}&to=${to.toJSON()}`);
        })
        .then(r => {
          expect(r.body).to.have.lengthOf(3);
        })
        // Get the errors by date (1 to 2 hours in the future), which should return an empty array
        .then(() => {
          const from = new Date();
          from.setHours(from.getHours() + 1);
          const to = new Date();
          to.setHours(to.getHours() + 2);

          return cloud.get(`/formulas/${fId}/instances/executions/errors?from=${from.toJSON()}&to=${to.toJSON()}`);
        })
        .then(r => {
          expect(r.body).to.have.lengthOf(0);
        });
    };

    return testIt('simple-error-formula-manual-v2', {}, 4, 3, null, instanceValidator, 'failed', 3);
  });

  it('should return 0 instances for 9 executions with filter failures only', () => {
    const instanceValidator = fId => {
      return cloud.get(`/formulas/${fId}/instances/executions/errors`)
        .then(r => {
          expect(r.body).to.have.lengthOf(0);
        });
    };

    const triggerCb = (fId, fiId) =>
      Promise.all(tools.times(3)(index => {
        return cloud.post(`/formulas/${fId}/instances/${fiId}/executions`, { foo: 'baz' });
      }));

    return testIt('simple-error-formula-manual-v2', {}, 3, 3, null, instanceValidator, 'failed', 3, triggerCb);
  });

  it('should disable the formula instance if it exceeds the thresholds', () => {
    var startingNotifications;
    const execValidator = (executions, fId, fiId) => {
      return cloud.get(`/formulas/${fId}/instances/${fiId}`)
        .then(r => {
          expect(r.body.active).to.be.false;
          expect(r.body.numberConsecutiveErrors).to.equal(101);
        })
        .then(r => cloud.get('/notifications?topics[]=threat-level-midnight'))
        .then(r => expect(parseInt(r.response.headers['elements-total-count']) - startingNotifications).to.equal(2));
    };

    const triggerCb = (fId, fiId) => {
      return cloud.put(`/formulas/${fId}/instances/${fiId}`, {
          firstConsecutiveErrorDate: '2017-01-01T01:00:00-00:00',
          numberConsecutiveErrors: 100
        })
        .then(r => cloud.post(`/formulas/${fId}/instances/${fiId}/executions`, { foo: 'bar' }));
    };

    return cloud.get('/notifications?topics[]=threat-level-midnight')
      .then(r => startingNotifications = parseInt(r.response.headers['elements-total-count']))
      .then(r => testIt('simple-error-formula-manual-v2', {}, 1, 3, execValidator, null, 'failed', 1, triggerCb));
  });

  it('should alert the owner of the formula instance if it exceeds 50% of the threshold', () => {
    var startingNotifications;
    const execValidator = (executions, fId, fiId) => {
      return cloud.get(`/formulas/${fId}/instances/${fiId}`)
        .then(r => {
          expect(r.body.active).to.be.true;
          expect(r.body.numberConsecutiveErrors).to.equal(51);
          expect(r.body.numberConsecutiveErrorWarningNotifications).to.equal(1);
        })
        .then(r => cloud.get('/notifications?topics[]=threat-level-midnight'))
        .then(r => expect(parseInt(r.response.headers['elements-total-count']) - startingNotifications).to.equal(2));
    };

    const triggerCb = (fId, fiId) => {
      return cloud.put(`/formulas/${fId}/instances/${fiId}`, {
          firstConsecutiveErrorDate: '2017-01-01T01:00:00-00:00',
          numberConsecutiveErrors: 50
        })
        .then(r => cloud.post(`/formulas/${fId}/instances/${fiId}/executions`, { foo: 'bar' }));
    };

    return cloud.get('/notifications?topics[]=threat-level-midnight')
      .then(r => startingNotifications = parseInt(r.response.headers['elements-total-count']))
      .then(r => testIt('simple-error-formula-manual-v2', {}, 1, 3, execValidator, null, 'failed', 1, triggerCb));
  });
});
