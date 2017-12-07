'use strict';

const logger = require('winston');
const suite = require('core/suite');
const cloud = require('core/cloud');
const defaults = require('core/defaults');
const chakram = require('chakram');
const expect = chakram.expect;
const tools = require('core/tools');
const R = require('ramda');

/**
 * Assuming that person running these tests is an organization admin.  If they're not, then you can't run these.
 */
suite.forPlatform('Tests privileges restrict API access as expected', test => {
  // privilege-based access test plan:
  //
  // assume organization admin is running the tests
  // create a new user in the default account
  // take snapshot of the "org" role's privileges
  // ----
  // change privileges of org role to have some access/some restrictions
  // make API calls as new user based around those privilege access/restrictions
  // ----
  // revert "org" role back to privileges taken in snapshot
  let newUser, orgRoleSnapshot;
  before(() => {
    const opts = { qs: { where: 'defaultAccount=true' } };
    return cloud.withOptions(opts).get('/accounts')
      .then(r => {
        expect(r.body.length).to.equal(1);
        const user = { email: `churros+rbac${tools.random()}@churros.com`, firstName: 'frank', lastName: 'ricard', password: 'bingobango' };
        return cloud.post(`/accounts/${r.body[0].id}/users`, user);
      })
      .then(r => {
        expect(r.body.roles).to.have.length.above(0);
        const orgRole = R.find(R.propEq('key', 'org'))(r.body.roles);
        expect(orgRole.privileges).to.have.length.above(0);

        // save to revert later
        orgRoleSnapshot = orgRole;
        newUser = r.body;
      });
  });

  after(() => {
    return cloud.delete(`/users/${newUser.id}`, () => true)
      .then(() => cloud.put(`/organizations/roles/${orgRoleSnapshot.id}`, orgRoleSnapshot, () => true));
  });

  const cloudWithUser = () => cloud.withOptions({ headers: { Authorization: `User ${newUser.secret}, Organization ${defaults.secrets().orgSecret}` } });

  const addPrivilegeIfNecessary = (privilegeKey) => {
    return cloudWithUser().get(`/users/${newUser.id}/roles`)
      .then(r => {
        const orgRole = tools.findInArray(r.body, 'key', 'org');
        const privilege = tools.findInArray(orgRole.privileges, 'key', privilegeKey);
        if (!R.isNil(privilege)) {
          logger.debug(`User already contained privilege '${privilegeKey}, so not adding'`);
          return Promise.resolve();
        }
        logger.debug(`Adding ${privilegeKey} to user's privileges`);
        return cloud.put(`/organizations/roles/${orgRole.id}`, { privileges: orgRole.privileges.concat({ key: privilegeKey }) });
      });
  };

  const removePrivilegeIfNecessary = (privilegeKey) => {
    return cloudWithUser().get(`/users/${newUser.id}/roles`)
      .then(r => {
        const orgRole = tools.findInArray(r.body, 'key', 'org');
        const privilege = tools.findInArray(orgRole.privileges, 'key', privilegeKey);
        if (R.isNil(privilege)) {
          logger.debug(`User does not contain privilege '${privilegeKey}, so not removing'`);
          return Promise.resolve();
        }
        logger.debug(`Removing ${privilegeKey} from user's privileges`);
        return cloud.put(`/organizations/roles/${orgRole.id}`, { privileges: orgRole.privileges.filter(p => p.key !== privilegeKey) });
      });
  };

  const insufficientPrivilegesValidator = r => expect(r).to.have.statusCode(403);

  context('formulas', () => {
    const DEFAULT_FORMULA = {
      name: `rbac${tools.random()}`,
      triggers: [{
        type: 'manual',
        onSuccess: ['done']
      }],
      steps: [{
        name: 'done',
        type: 'filter',
        properties: {
          body: 'done(true);'
        }
      }]
    };

    const DEFAULT_FORMULA_INSTANCE = {
      name: `rbac-formula-instance${tools.random()}`,
    };

    it('should restrict access to viewing formulas without the viewFormulas privilege', () => {
      return removePrivilegeIfNecessary('viewFormulas')
        .then(() => cloudWithUser().get(`/formulas`, insufficientPrivilegesValidator));
    });

    it('should restrict access to creating formulas without the createFormula privilege', () => {
      return removePrivilegeIfNecessary('createFormulas')
        .then(() => cloudWithUser().post(`/formulas`, DEFAULT_FORMULA, insufficientPrivilegesValidator));
    });

    it('should restrict access to creating formulas without the createFormulas privilege', () => {
      return removePrivilegeIfNecessary('createFormulas')
        .then(() => cloudWithUser().post(`/formulas`, DEFAULT_FORMULA, insufficientPrivilegesValidator));
    });

    it('should restrict access to editing formulas without the editFormulas privilege', () => {
      let formulaId;
      return addPrivilegeIfNecessary('createFormulas')
        .then(() => cloudWithUser().post(`/formulas`, DEFAULT_FORMULA))
        .then(r => formulaId = r.body.id)
        .then(() => removePrivilegeIfNecessary('editFormulas'))
        .then(() => cloudWithUser().put(`/formulas/${formulaId}`, DEFAULT_FORMULA, insufficientPrivilegesValidator))
        .then(() => cloudWithUser().delete(`/formulas/${formulaId}`))
        .catch(() => cloudWithUser().delete(`/formulas/${formulaId}`));
    });

    it('should restrict access to deleting formulas without the deleteFormulas privilege', () => {
      let formulaId;
      return addPrivilegeIfNecessary('createFormulas')
        .then(() => cloudWithUser().post(`/formulas`, DEFAULT_FORMULA))
        .then(r => formulaId = r.body.id)
        .then(() => removePrivilegeIfNecessary('deleteFormulas'))
        .then(() => cloudWithUser().delete(`/formulas/${formulaId}`, insufficientPrivilegesValidator))
        .then(() => addPrivilegeIfNecessary('deleteFormulas'))
        .then(() => cloudWithUser().delete(`/formulas/${formulaId}`))
        .catch(() => cloudWithUser().delete(`/formulas/${formulaId}`));
    });

    it('should restrict access to creating a formula instance without the createFormulaInstances privilege', () => {
      let formulaId, formulaInstanceId;
      const cleanup = () => {
        if (!R.isNil(formulaId)) {
          cloudWithUser().delete(`/formulas/${formulaId}`, R.always(true));
        }
        if (!R.isNil(formulaInstanceId)) {
          cloudWithUser().delete(`/formulas/instances/${formulaInstanceId}`, R.always(true));
        }
      };
      return addPrivilegeIfNecessary('createFormulas')
        .then(() => cloudWithUser().post(`/formulas`, DEFAULT_FORMULA))
        .then(r => formulaId = r.body.id)
        .then(() => removePrivilegeIfNecessary('createFormulaInstances'))
        .then(() => cloudWithUser().post(`/formulas/${formulaId}/instances`, DEFAULT_FORMULA_INSTANCE, insufficientPrivilegesValidator))
        .then(() => addPrivilegeIfNecessary('createFormulaInstances'))
        .then(() => cloudWithUser().post(`/formulas/${formulaId}/instances`, DEFAULT_FORMULA_INSTANCE))
        .then(r => formulaInstanceId = r.body.id)
        .then(() => addPrivilegeIfNecessary('deleteFormulas'))
        .then(cleanup)
        .catch(cleanup);
    });
  });

  context('elements', () => {
    const DEFAULT_ELEMENT = () => ({
      name: `rbac${tools.random()}`,
      description: 'An element that is used for testing in nom nom nom churros',
      authentication: {
        type: 'custom'
      }
    });

    const DEFAULT_ELEMENT_INSTANCE = () => ({
      name: `rbac${tools.random()}`
    });

    /* TODO - JJW
     have not implemented this yet, as from way back in the day we allowed GET /elements to be used without auth.
     I'm not sure if anyone (or are docs) still rely on that so I didn't remove it.
     */
    it('should restrict access to viewing elements without the viewElements privilege');

    it('should restrict access to creating elements without the createElements privilege', () => {
      return removePrivilegeIfNecessary('createElements')
        .then(() => cloudWithUser().post(`/elements`, DEFAULT_ELEMENT(), insufficientPrivilegesValidator));
    });

    it('should restrict access to editing an element without the editElements privilege', () => {
      let elementId;
      const cleanup = () => {
        if (R.isNil(elementId)) {
          cloudWithUser().delete(`/elements/${elementId}`, R.always(true));
        }
      };

      return addPrivilegeIfNecessary('createElements')
        .then(() => cloudWithUser().post(`/elements`, DEFAULT_ELEMENT()))
        .then(r => elementId = r.body.id)
        .then(() => removePrivilegeIfNecessary('editElements'))
        .then(() => cloudWithUser().put(`/elements/${elementId}`, DEFAULT_ELEMENT(), insufficientPrivilegesValidator))
        .then(() => addPrivilegeIfNecessary('deleteElements'))
        .then(cleanup);
    });

    it('should restrict access to deleting elements without the deleteElements privilege', () => {
      let elementId;
      const cleanup = () => {
        if (!R.isNil(elementId)) {
          cloudWithUser().delete(`/elements/${elementId}`, R.always(true));
        }
      };

      return addPrivilegeIfNecessary('createElements')
        .then(() => cloudWithUser().post(`/elements`, DEFAULT_ELEMENT()))
        .then(r => elementId = r.body.id)
        .then(() => removePrivilegeIfNecessary('deleteElements'))
        .then(() => cloudWithUser().delete(`/elements/${elementId}`, insufficientPrivilegesValidator))
        .then(() => addPrivilegeIfNecessary('deleteElements'))
        .then(cleanup);
    });

    it('should restrict access to creating element instances without the createElementInstances privilege', () => {
      let elementId, elementInstanceId;
      const cleanup = () => {
        if (!R.isNil(elementId)) {
          cloudWithUser().delete(`/elements/${elementId}`, R.always(true));
        }

        if (!R.isNil(elementInstanceId)) {
          cloudWithUser().delete(`/instances/${elementInstanceId}`, R.always(true));
        }
      };

      return addPrivilegeIfNecessary('createElements')
        .then(() => cloudWithUser().post(`/elements`, DEFAULT_ELEMENT()))
        .then(r => elementId = r.body.id)
        .then(() => removePrivilegeIfNecessary('createElementInstances'))
        .then(() => cloudWithUser().post(`/elements/${elementId}/instances`, DEFAULT_ELEMENT_INSTANCE(), insufficientPrivilegesValidator))
        .then(() => addPrivilegeIfNecessary('createElementInstances'))
        .then(() => cloudWithUser().post(`/elements/${elementId}/instances`, DEFAULT_ELEMENT_INSTANCE()))
        .then(r => elementInstanceId = r.body.id)
        .then(cleanup);
    });
  });

  context('common objects', () => {
    const DEFAULT_COMMON_OBJECT = {
      name: `rbac${tools.random()}`,
      fields: [{
        path: 'id',
        type: 'number'
      }]
    };

    it('should restrict access to viewing common objects without the viewCommonObjects privilege', () => {
      return removePrivilegeIfNecessary('viewCommonObjects')
        .then(() => cloudWithUser().get(`/organizations/objects/definitions`, insufficientPrivilegesValidator))
        .then(() => addPrivilegeIfNecessary('viewCommonObjects'))
        .then(() => cloudWithUser().get(`/organizations/objects/definitions`));
    });

    it('should restrict access to creating, editing, and deleting common objects without the proper privileges', () => {
      const cleanup = () => {
        return cloudWithUser().delete(`/organizations/objects/${DEFAULT_COMMON_OBJECT.name}/definitions`);
      };
      return removePrivilegeIfNecessary('createCommonObjects')
        .then(() => cloudWithUser().post(`/organizations/objects/${DEFAULT_COMMON_OBJECT.name}/definitions`, DEFAULT_COMMON_OBJECT, insufficientPrivilegesValidator))
        .then(() => addPrivilegeIfNecessary('createCommonObjects'))
        .then(() => cloudWithUser().post(`/organizations/objects/${DEFAULT_COMMON_OBJECT.name}/definitions`, DEFAULT_COMMON_OBJECT))
        .then(() => removePrivilegeIfNecessary('editCommonObjects'))
        .then(() => cloudWithUser().put(`/organizations/objects/${DEFAULT_COMMON_OBJECT.name}/definitions`, DEFAULT_COMMON_OBJECT, insufficientPrivilegesValidator))
        .then(() => addPrivilegeIfNecessary('editCommonObjects'))
        .then(() => cloudWithUser().put(`/organizations/objects/${DEFAULT_COMMON_OBJECT.name}/definitions`, DEFAULT_COMMON_OBJECT))
        .then(() => removePrivilegeIfNecessary('deleteCommonObjects'))
        .then(() => cloudWithUser().delete(`/organizations/objects/${DEFAULT_COMMON_OBJECT.name}/definitions`, insufficientPrivilegesValidator))
        .then(() => addPrivilegeIfNecessary('deleteCommonObjects'))
        .then(cleanup);
    });
  });
});
