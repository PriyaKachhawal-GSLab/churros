'use strict';

const common = require('./assets/common');
const expect = require('chakram').expect;
const cloud = require('core/cloud');
const tools = require('core/tools');
const suite = require('core/suite');
const props = require('core/props');
const logger = require('winston');

const defaultTriggerCb = numEs => (fId, fiId) =>
  Promise.all(tools.times(numEs)(index => {
    return cloud.post(`/formulas/${fId}/instances/${fiId}/executions`, { foo: `${(index + 1) % numEs === 0 ? 'baz' : 'bar'}` });
  }));

suite.forPlatform('formulas', { name: 'formula analytics' }, (test) => {

  if (props.get('url').indexOf('snapshot') < 0 && props.get('url').indexOf('staging') < 0 && props.get('url').indexOf('production') < 0) {
    logger.warn('Unable to run formula analytics locally. Skipping.');
    return;
  }

  /**
   * Handles the basic formula execution test for a formula that has a manual trigger type
   */
  const testIt = (fName, configuration, numEs, numSevs, execValidator, instanceValidator, executionStatus, numInstances, triggerCb) => {
    const f = require(`./assets/formulas/${fName}`);
    let fi = { name: 'churros-manual-formula-instance' };

    if (configuration) {
        fi.configuration = configuration;
    }

    const execValidatorWrapper = (executions, numEs, numSes, executionStatus, fId, fiId) => {
      common.defaultValidator(executions, numEs, numSes, executionStatus);
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

  it('should return execution analytics of 3 executions', () => {
    const execValidator = (executions, fId, fiId) => {
      // Get the execution analytics without from and to dates
      return cloud.get(`/formulas/analytics`)
      .then(r => expect(r.body).to.have.length(8))
      // Get the execution analytics with from and to dates
      .then(() => {
        const from = new Date();
        from.setHours(from.getHours() - 1);
        const to = new Date();
        return cloud.get(`/formulas/analytics?from=${from.toJSON()}&to=${to.toJSON()}&interval=minute`);
      })
      .then(r => expect(r.body).to.have.length(61) && expect(r.body.reduce((accum, curr) => accum + curr.count, 0)).to.be.at.least(3));
    };

    return testIt('manual-trigger', {}, 3, 2, execValidator, null, 'success', 1);
  });

  it('should return an error for an invalid date range for execution analytics', () => {
    const from = new Date();
    from.setHours(from.getHours() - 1);
    const to = new Date();
    to.setHours(to.getHours() - 2);
    return cloud.get(`/formulas/analytics?from=${from.toJSON()}&to=${to.toJSON()}&interval=minute`, r => expect(r).to.have.statusCode(400))
      .then(r => expect(r.body).to.contain.all.keys(['requestId', 'message']));
  });

  it('should return an error for an invalid interval for execution analytics', () => {
    const from = new Date();
    from.setHours(from.getHours() - 24);
    const to = new Date();
    return cloud.get(`/formulas/analytics?from=${from.toJSON()}&to=${to.toJSON()}&interval=second`, r => expect(r).to.have.statusCode(400))
      .then(r => expect(r.body).to.contain.all.keys(['requestId', 'message']));
  });

  it('should return step analytics of 3 executions', () => {
    const execValidator = (executions, fId, fiId) => {
      // Get the execution analytics without from and to dates
      return cloud.get(`/formulas/analytics/steps`)
      .then(r => expect(r.body).to.have.length(8) && r.body.map(s => expect(s).to.contain.all.keys(['count', 'executionTime', 'executionDelay', 'contextSize', 'timestamp'])))
      // Get the execution analytics with from and to dates
      .then(() => {
        const from = new Date();
        from.setHours(from.getHours() - 1);
        const to = new Date();
        return cloud.get(`/formulas/analytics/steps?from=${from.toJSON()}&to=${to.toJSON()}&interval=minute`);
      })
      .then(r => expect(r.body).to.have.length(61) &&
        expect(r.body.reduce((accum, curr) => accum + curr.count, 0)).to.be.at.least(6) &&
        r.body.map(s => expect(s).to.have.contain.keys(['count', 'executionTime', 'executionDelay', 'contextSize', 'timestamp'])));
    };

    return testIt('manual-trigger', {}, 3, 2, execValidator, null, 'success', 1);
  });

  it('should return an error for an invalid date range for step execution analytics', () => {
    const from = new Date();
    from.setHours(from.getHours() - 1);
    const to = new Date();
    to.setHours(to.getHours() - 2);
    return cloud.get(`/formulas/analytics/steps?from=${from.toJSON()}&to=${to.toJSON()}&interval=minute`, r => expect(r).to.have.statusCode(400))
      .then(r => expect(r.body).to.contain.all.keys(['requestId', 'message']));
  });

  it('should return an error for an invalid interval for step execution analytics', () => {
    const from = new Date();
    from.setHours(from.getHours() - 24);
    const to = new Date();
    return cloud.get(`/formulas/analytics/steps?from=${from.toJSON()}&to=${to.toJSON()}&interval=second`, r => expect(r).to.have.statusCode(400))
      .then(r => expect(r.body).to.contain.all.keys(['requestId', 'message']));
  });

  it('should return status analytics of 3 executions', () => {
    const execValidator = (executions, fId, fiId) => {
      // Get the execution analytics without from and to dates
      return cloud.get(`/formulas/analytics/statuses`)
      .then(r => expect(r.body).to.have.length(8) && r.body.map(s => expect(s).to.contain.all.keys(['success', 'failed', 'total', 'timestamp'])))
      // Get the execution analytics with from and to dates
      .then(() => {
        const from = new Date();
        from.setHours(from.getHours() - 1);
        const to = new Date();
        return cloud.get(`/formulas/analytics/statuses?from=${from.toJSON()}&to=${to.toJSON()}&interval=minute`);
      })
      .then(r => expect(r.body).to.have.length(61) &&
        expect(r.body.reduce((accum, curr) => accum + curr.success, 0)).to.be.at.least(3) &&
        r.body.map(s => expect(s).to.have.contain.keys(['success', 'failed', 'timestamp'])));
    };

    return testIt('manual-trigger', {}, 3, 2, execValidator, null, 'success', 1);
  });

  it('should return an error for an invalid date range for execution status analytics', () => {
    const from = new Date();
    from.setHours(from.getHours() - 1);
    const to = new Date();
    to.setHours(to.getHours() - 2);
    return cloud.get(`/formulas/analytics/statuses?from=${from.toJSON()}&to=${to.toJSON()}&interval=minute`, r => expect(r).to.have.statusCode(400))
      .then(r => expect(r.body).to.contain.all.keys(['requestId', 'message']));
  });

  it('should return an error for an invalid interval for execution status analytics', () => {
    const from = new Date();
    from.setHours(from.getHours() - 24);
    const to = new Date();
    return cloud.get(`/formulas/analytics/statuses?from=${from.toJSON()}&to=${to.toJSON()}&interval=second`, r => expect(r).to.have.statusCode(400))
      .then(r => expect(r.body).to.contain.all.keys(['requestId', 'message']));
  });

  it('should return analytics of 3 executions by account', () => {
    const execValidator = (executions, fId, fiId) => {
      // Get the execution analytics without from and to dates
      return cloud.get(`/formulas/analytics/accounts`)
      //.then(r => {console.log(r.body); return r;})
      .then(r => tools.wait.upTo(90000).for(() => {
        const total = r.body.reduce((accum, curr) =>
          accum + curr.records[0] ? (curr.records[0].success + curr.records[0].failed) : 0, 0);
        return Promise.resolve(expect(r.body).to.have.length(8) &&
        r.body.map(s => expect(s).to.contain.all.keys(['records', 'total', 'timestamp'])) &&
        expect(total).to.be.at.least(3));
      }))
      // Get the execution analytics with from and to dates
      .then(() => {
        const from = new Date();
        from.setHours(from.getHours() - 1);
        const to = new Date();
        return cloud.get(`/formulas/analytics/accounts?from=${from.toJSON()}&to=${to.toJSON()}&interval=minute`);
      })
      .then(r =>
        tools.wait.upTo(90000).for(() => Promise.resolve(expect(r.body).to.have.length(61) &&
          expect(r.body.reduce((accum, curr) => accum + (curr.records[0] ? curr.records[0].success : 0), 0)).to.be.at.least(3) &&
            r.body.map(s => expect(s).to.have.contain.keys(['records', 'total', 'timestamp']))
        )));
    };

    return testIt('manual-trigger', {}, 3, 2, execValidator, null, 'success', 1);
  });

  it('should return an error for an invalid date range for execution analytics by account', () => {
    const from = new Date();
    from.setHours(from.getHours() - 1);
    const to = new Date();
    to.setHours(to.getHours() - 2);
    return cloud.get(`/formulas/analytics/accounts?from=${from.toJSON()}&to=${to.toJSON()}&interval=minute`, r => expect(r).to.have.statusCode(400))
      .then(r => expect(r.body).to.contain.all.keys(['requestId', 'message']));
  });

  it('should return an error for an invalid interval for execution analytics by account', () => {
    const from = new Date();
    from.setHours(from.getHours() - 24);
    const to = new Date();
    return cloud.get(`/formulas/analytics/accounts?from=${from.toJSON()}&to=${to.toJSON()}&interval=second`, r => expect(r).to.have.statusCode(400))
      .then(r => expect(r.body).to.contain.all.keys(['requestId', 'message']));
  });

  it('should return analytics of 3 executions by instance', () => {
    const execValidator = (executions, fId, fiId) => {
      // Get the execution analytics without from and to dates
      return cloud.get(`/formulas/analytics/instances`)
      //.then(r => {console.log(r.body); return r;})
      .then(r => tools.wait.upTo(90000).for(() => {
        const countTotal = r.body.reduce((accum, curr) =>
          accum + (curr.records[0] ? curr.records.reduce((a, c) => a + c.count, 0) : 0), 0);
        return Promise.resolve(expect(r.body).to.have.length(8) &&
          r.body.map(s => expect(s).to.contain.all.keys(['records', 'total', 'timestamp'])) &&
          expect(countTotal).to.be.at.least(3));
      }))
      // Get the execution analytics with from and to dates
      .then(() => {
        const from = new Date();
        from.setHours(from.getHours() - 1);
        const to = new Date();
        return cloud.get(`/formulas/analytics/instances?from=${from.toJSON()}&to=${to.toJSON()}&interval=minute`);
      })
      .then(r => tools.wait.upTo(90000).for(() => Promise.resolve(expect(r.body).to.have.length(61) &&
        r.body.map(s => expect(s).to.have.contain.keys(['records', 'total', 'timestamp'])) &&
        expect(r.body.reduce((accum, curr) =>
          accum + (curr.records[0] ? curr.records.reduce((a, c) => a + c.count, 0) : 0), 0)).to.be.at.least(3)
      )));
    };

    return testIt('manual-trigger', {}, 3, 2, execValidator, null, 'success', 1);
  });

  it('should return an error for an invalid date range for execution analytics by instance', () => {
    const from = new Date();
    from.setHours(from.getHours() - 1);
    const to = new Date();
    to.setHours(to.getHours() - 2);
    return cloud.get(`/formulas/analytics/instances?from=${from.toJSON()}&to=${to.toJSON()}&interval=minute`, r => expect(r).to.have.statusCode(400))
      .then(r => expect(r.body).to.contain.all.keys(['requestId', 'message']));
  });

  it('should return an error for an invalid interval for execution analytics by instance', () => {
    const from = new Date();
    from.setHours(from.getHours() - 24);
    const to = new Date();
    return cloud.get(`/formulas/analytics/instances?from=${from.toJSON()}&to=${to.toJSON()}&interval=second`, r => expect(r).to.have.statusCode(400))
      .then(r => expect(r.body).to.contain.all.keys(['requestId', 'message']));
  });
});
