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
  let defaultAccountId, newUser, orgRoleSnapshot;
  before(() => {
    const opts = { qs: { where: 'defaultAccount=true' } };
    return cloud.withOptions(opts).get('/accounts')
      .then(r => {
        expect(r.body.length).to.equal(1);
        const user = { email: `churros+rbac${tools.random()}@churros.com`, firstName: 'frank', lastName: 'ricard', password: 'bingobango' };
        defaultAccountId = r.body[0].id;
        return cloud.post(`/accounts/${defaultAccountId}/users`, user);
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
    return cloud.delete(`/users/${newUser.id}`, R.always(true))
      .then(() => cloud.put(`/organizations/roles/${orgRoleSnapshot.id}`, orgRoleSnapshot, R.always(true)));
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
        .then(() => cloudWithUser().get(`/formulas`, insufficientPrivilegesValidator))
        .then(() => addPrivilegeIfNecessary('viewFormulas'))
        .then(() => cloudWithUser().get(`/formulas`));
    });

    it('should restrict access to creating, editing, and deleting formulas without the necessary privilege', () => {
      let formulaId, formulaInstanceId;
      const cleanup = () => {
        if (!R.isNil(formulaInstanceId)) {
          cloudWithUser().delete(`/formulas/instances/${formulaInstanceId}`, R.always(true));
        }
        if (!R.isNil(formulaId)) {
          cloudWithUser().delete(`/formulas/${formulaId}`, R.always(true));
        }
      };

      return removePrivilegeIfNecessary('createFormulas')
        .then(() => cloudWithUser().post(`/formulas`, DEFAULT_FORMULA, insufficientPrivilegesValidator))
        .then(() => addPrivilegeIfNecessary('createFormulas'))
        .then(() => cloudWithUser().post(`/formulas`, DEFAULT_FORMULA))
        .then(r => formulaId = r.body.id)
        .then(() => removePrivilegeIfNecessary('editFormulas'))
        .then(() => cloudWithUser().put(`/formulas/${formulaId}`, DEFAULT_FORMULA, insufficientPrivilegesValidator))
        .then(() => addPrivilegeIfNecessary('editFormulas'))
        .then(() => cloudWithUser().put(`/formulas/${formulaId}`, DEFAULT_FORMULA))
        .then(() => removePrivilegeIfNecessary('createFormulaInstances'))
        .then(() => cloudWithUser().post(`/formulas/${formulaId}/instances`, DEFAULT_FORMULA_INSTANCE, insufficientPrivilegesValidator))
        .then(() => addPrivilegeIfNecessary('createFormulaInstances'))
        .then(() => cloudWithUser().post(`/formulas/${formulaId}/instances`, DEFAULT_FORMULA_INSTANCE))
        .then(() => removePrivilegeIfNecessary('deleteFormulas'))
        .then(() => cloudWithUser().delete(`/formulas/${formulaId}`, insufficientPrivilegesValidator))
        .then(() => addPrivilegeIfNecessary('deleteFormulas'))
        .then(cleanup);
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

    it('should restrict access to viewing elements without the viewElements privilege', () => {
      const opts = { qs: { page: 1, pageSize: 1 } };
      return removePrivilegeIfNecessary('viewElements')
        .then(() => cloudWithUser().withOptions(opts).get(`/elements`, insufficientPrivilegesValidator))
        .then(() => addPrivilegeIfNecessary('viewElements'))
        .then(() => cloudWithUser().withOptions(opts).get(`/elements`));
    });

    it('should restrict access to creating, editing, and deleting an element without the editElements privilege', () => {
      let elementId, elementInstanceId;
      const cleanup = () => {
        if (!R.isNil(elementInstanceId)) {
          cloudWithUser().delete(`/instances/${elementInstanceId}`, R.always(true));
        }

        if (!R.isNil(elementId)) {
          cloudWithUser().delete(`/elements/${elementId}`, R.always(true));
        }
      };

      return removePrivilegeIfNecessary('createElements')
        .then(() => cloudWithUser().post(`/elements`, DEFAULT_ELEMENT(), insufficientPrivilegesValidator))
        .then(() => addPrivilegeIfNecessary('createElements'))
        .then(() => cloudWithUser().post(`/elements`, DEFAULT_ELEMENT()))
        .then(r => elementId = r.body.id)
        .then(() => removePrivilegeIfNecessary('editElements'))
        .then(() => cloudWithUser().put(`/elements/${elementId}`, DEFAULT_ELEMENT(), insufficientPrivilegesValidator))
        .then(() => addPrivilegeIfNecessary('editElements'))
        .then(() => cloudWithUser().put(`/elements/${elementId}`, DEFAULT_ELEMENT()))
        .then(() => removePrivilegeIfNecessary('deleteElements'))
        .then(() => cloudWithUser().delete(`/elements/${elementId}`, insufficientPrivilegesValidator))
        .then(() => removePrivilegeIfNecessary('createElementInstances'))
        .then(() => cloudWithUser().post(`/elements/${elementId}/instances`, DEFAULT_ELEMENT_INSTANCE(), insufficientPrivilegesValidator))
        .then(() => addPrivilegeIfNecessary('createElementInstances'))
        .then(() => cloudWithUser().post(`/elements/${elementId}/instances`, DEFAULT_ELEMENT_INSTANCE()))
        .then(() => addPrivilegeIfNecessary('deleteElements'))
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
      const cleanup = () => cloudWithUser().delete(`/organizations/objects/${DEFAULT_COMMON_OBJECT.name}/definitions`, R.always(true));

      return removePrivilegeIfNecessary('createCommonObjects')
        .then(() => cloudWithUser().post(`/organizations/objects/${DEFAULT_COMMON_OBJECT.name}/definitions`, DEFAULT_COMMON_OBJECT, insufficientPrivilegesValidator))
        .then(() => cloudWithUser().post(`/accounts/objects/${DEFAULT_COMMON_OBJECT.name}/definitions`, DEFAULT_COMMON_OBJECT, insufficientPrivilegesValidator))
        .then(() => addPrivilegeIfNecessary('createCommonObjects'))
        .then(() => cloudWithUser().post(`/organizations/objects/${DEFAULT_COMMON_OBJECT.name}/definitions`, DEFAULT_COMMON_OBJECT))
        .then(() => cloudWithUser().post(`/accounts/objects/${DEFAULT_COMMON_OBJECT.name}/definitions`, DEFAULT_COMMON_OBJECT))
        .then(() => removePrivilegeIfNecessary('editCommonObjects'))
        .then(() => cloudWithUser().put(`/organizations/objects/${DEFAULT_COMMON_OBJECT.name}/definitions`, DEFAULT_COMMON_OBJECT, insufficientPrivilegesValidator))
        .then(() => cloudWithUser().put(`/accounts/objects/${DEFAULT_COMMON_OBJECT.name}/definitions`, DEFAULT_COMMON_OBJECT, insufficientPrivilegesValidator))
        .then(() => addPrivilegeIfNecessary('editCommonObjects'))
        .then(() => cloudWithUser().put(`/organizations/objects/${DEFAULT_COMMON_OBJECT.name}/definitions`, DEFAULT_COMMON_OBJECT))
        .then(() => cloudWithUser().put(`/accounts/objects/${DEFAULT_COMMON_OBJECT.name}/definitions`, DEFAULT_COMMON_OBJECT))
        .then(() => removePrivilegeIfNecessary('deleteCommonObjects'))
        .then(() => cloudWithUser().delete(`/organizations/objects/${DEFAULT_COMMON_OBJECT.name}/definitions`, insufficientPrivilegesValidator))
        .then(() => addPrivilegeIfNecessary('deleteCommonObjects'))
        .then(cleanup);
    });
  });

  context('user preferences/branding', () => {
    const branding = {
      headerFont: 'Helvetica',
      headerColor: '#586f75',
      bodyFont: 'Helvetica',
      bodyColor: '#aedce7',
      themePrimaryColor: '#586f75',
      themeSecondaryColor: '#aedce7',
      themeHighlightColor: '#468499',
      buttonPrimaryBackgroundColor: '#c64',
      buttonPrimaryTextColor: '#aedce7',
      buttonSecondaryBackgroundColor: '#aedce7',
      buttonSecondaryTextColor: '#cc6649',
      buttonDeleteBackgroundColor: '#eee',
      buttonDeleteTextColor: '#FFF',
      logoBackgroundColor: '#ffffff',
      topBarBackgroundColor: '#aedce7',
      navigationBackgroundColor: '#aedce7',
      contextBackgroundColor: '#aedce7',
    };

    it('should restrict access to updating the organization branding information with the proper privilege', () => {
      return removePrivilegeIfNecessary('manageUiBranding')
        .then(() => cloudWithUser().delete(`/organizations/branding`, insufficientPrivilegesValidator))
        .then(() => cloudWithUser().put(`/organizations/branding`, branding, insufficientPrivilegesValidator))
        .then(() => addPrivilegeIfNecessary('manageUiBranding'))
        .then(() => cloudWithUser().put(`/organizations/branding`, branding))
        .then(() => cloudWithUser().delete(`/organizations/branding`));
    });
  });

  context('account management', () => {
    const viewTest = (level, levelPrivilegeSuffix) => {
      return removePrivilegeIfNecessary(`viewUsers${levelPrivilegeSuffix}`)
        .then(() => cloudWithUser().get(`/${level}/${defaultAccountId}/users`, insufficientPrivilegesValidator))
        .then(() => addPrivilegeIfNecessary(`viewUsers${levelPrivilegeSuffix}`))
        .then(() => cloudWithUser().get(`/${level}/${defaultAccountId}/users`));
    };

    it('should restrict viewing account users without the proper privilege', () => {
      return viewTest('acounts', 'Account');
    });

    it('should restrict creating, editing, and deleting a new account user without the proper privileges', () => {
      const user = { email: `churros+rbac${tools.random()}@churros.com`, firstName: 'joseph-account', lastName: 'pulaski', password: 'bingobango' };
      let userId;
      return removePrivilegeIfNecessary('addUsersAccount')
        .then(() => cloudWithUser().post(`/accounts/${defaultAccountId}/users`, user, insufficientPrivilegesValidator))
        .then(() => addPrivilegeIfNecessary('addUsersAccount'))
        .then(() => cloudWithUser().post(`/accounts/${defaultAccountId}/users`, user))
        .then(r => userId = r.body.id)
        .then(() => removePrivilegeIfNecessary('editUsersAccount'))
        .then(() => cloudWithUser().patch(`/accounts/${defaultAccountId}/users/${userId}`, user, insufficientPrivilegesValidator))
        .then(() => addPrivilegeIfNecessary('editUsersAccount'))
        .then(() => cloudWithUser().patch(`/accounts/${defaultAccountId}/users/${userId}`, user))
        .then(() => removePrivilegeIfNecessary('deleteUsersAccount'))
        .then(() => cloudWithUser().delete(`/accounts/${defaultAccountId}/users/${userId}`, insufficientPrivilegesValidator))
        .then(() => addPrivilegeIfNecessary('deleteUsersAccount'))
        .then(() => cloudWithUser().delete(`/accounts/${defaultAccountId}/users/${userId}`));
    });

    it('should restrict viewing organization users without the proper privilege', () => {
      return viewTest('organizations', 'Org');
    });

    it('should restrict creating, editing, and eleting a new organization user without the proper privileges', () => {
      const user = { email: `churros+rbac${tools.random()}@churros.com`, firstName: 'joseph-organization', lastName: 'pulaski', password: 'bingobango' };
      let userId;
      return removePrivilegeIfNecessary('addUsersOrg')
        .then(() => cloudWithUser().post(`/organizations/users`, user, insufficientPrivilegesValidator))
        .then(() => addPrivilegeIfNecessary('addUsersOrg'))
        .then(() => cloudWithUser().post(`/organizations/users`, user))
        .then(r => userId = r.body.id)
        .then(() => removePrivilegeIfNecessary('editUsersOrg'))
        .then(() => cloudWithUser().patch(`/organizations/users/${userId}`, user, insufficientPrivilegesValidator))
        .then(() => addPrivilegeIfNecessary('editUsersOrg'))
        .then(() => cloudWithUser().patch(`/organizations/users/${userId}`, user))
        .then(() => removePrivilegeIfNecessary('deleteUsersOrg'))
        .then(() => cloudWithUser().delete(`/organizations/users/${userId}`, insufficientPrivilegesValidator))
        .then(() => addPrivilegeIfNecessary('deleteUsersOrg'))
        .then(() => cloudWithUser().delete(`/organizations/users/${userId}`));
    });
  });

  context('logs', () => {
    it('should restrict access to any audit log data without the proper privilege', () => {
      const customValidator = r => {
        // if a user does not have ES setup/running locally they'll get a 500 here.  That's kind of fine,
        // cause it at least shows they have the privilege to go get the audit logs.
        const statusCode = r.response.statusCode;
        expect(statusCode).to.be.oneOf([200, 500]);
      };
      return removePrivilegeIfNecessary('viewLogs')
        .then(() => cloudWithUser().get(`/audit-logs`, insufficientPrivilegesValidator))
        .then(() => addPrivilegeIfNecessary('viewLogs'))
        .then(() => cloudWithUser().get(`/audit-logs`, customValidator));
    });
  });

  context('security', () => {
    const passwordPolicy = { minLength: 8, minUppercase: 0, minLowercase: 0, minNumbers: 0, minSymbols: 0, symbolCharacterSet: '!@#$%^&*()', previousPasswordCount: 0, expirationDays: 1000, };
    it('should restrict modifying the password policy without the proper privilege', () => {
      return removePrivilegeIfNecessary('modifySecurity')
        .then(() => cloudWithUser().put(`/organizations/password-policies`, passwordPolicy, insufficientPrivilegesValidator))
        .then(() => cloudWithUser().delete(`/organizations/password-policies`, insufficientPrivilegesValidator))
        .then(() => addPrivilegeIfNecessary('modifySecurity'))
        .then(() => cloudWithUser().put(`/organizations/password-policies`, passwordPolicy))
        .then(() => cloudWithUser().delete(`/organizations/password-policies`));
    });
  });

  context('roles', () => {
    it('should restrict viewing roles if the user does not have the proper privilege for configuring organization roles', () => {
      return removePrivilegeIfNecessary('configureRoles')
        .then(() => cloudWithUser().get(`/organizations/roles`, insufficientPrivilegesValidator))
        .then(() => addPrivilegeIfNecessary('configureRoles'))
        .then(() => cloudWithUser().get(`/organizations/roles`));
    });
  });
});
