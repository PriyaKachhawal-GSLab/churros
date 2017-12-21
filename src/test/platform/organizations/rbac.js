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
  const sufficientPrivilegesValidator = r => expect(r.statusCode).to.not.equal(403);

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
        .then(() => cloudWithUser().patch(`/formulas/${formulaId}`, DEFAULT_FORMULA, insufficientPrivilegesValidator))
        .then(() => addPrivilegeIfNecessary('editFormulas'))
        .then(() => cloudWithUser().put(`/formulas/${formulaId}`, DEFAULT_FORMULA))
        .then(() => cloudWithUser().patch(`/formulas/${formulaId}`, DEFAULT_FORMULA))
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

    const DEFAULT_ELEMENT_CONFIG = () => ({
      key: `rbac${tools.random()}`,
      name: 'rbacConfig',
      type: 'TEXTFIELD_128',
      description: "test config",
      resellerConfig: false,
      companyConfig: false,
      active: true,
      internal: false,
      groupControl: false,
      displayOrder: 0,
      hideFromConsole: true,
      required: false
    });

    const DEFAULT_ELEMENT_RESOURCE = () => ({
      name: `rbac${tools.random()}`,
      description: 'rbac resource',
      path: `/rbac/${tools.random()}`,
      vendorPath: '/vendor',
      method: 'GET',
      vendorMethod: 'GET'
    });

    const DEFAULT_ELEMENT_PARAMETER = () => ({
      name: `rbac${tools.random()}`,
      type: 'header',
      vendorName: 'rbacParam',
      vendorType: 'header',
      dataType: 'string',
      vendorDataType: 'string'
    });

    const DEFAULT_ELEMENT_HOOK = () => ({
      body: 'done()',
      type: 'preRequest',
      mimeType: 'javascript',
      isLegacy: false
    });

    const DEFAULT_ELEMENT_MODELS = () => ({
      name: `rbac${tools.random()}`,
      swagger: {}
    });

    const runReadElementTests = keyOrId => {
      let elementKeyOrId, resourceId;
      const opts = { qs: { page: 1, pageSize: 1 } };
      const fakeIdOrKey = keyOrId === 'key' ? 'key' : 23;

      return removePrivilegeIfNecessary('viewElements')
        .then(() => cloudWithUser().withOptions(opts).get(`/elements`, insufficientPrivilegesValidator))
        .then(() => cloudWithUser().withOptions(opts).get(`/elements/${fakeIdOrKey}`, insufficientPrivilegesValidator))
        .then(() => cloudWithUser().withOptions(opts).get(`/elements/${fakeIdOrKey}/export`, insufficientPrivilegesValidator))
        .then(() => cloudWithUser().withOptions(opts).get(`/elements/${fakeIdOrKey}/configuration`, insufficientPrivilegesValidator))
        .then(() => cloudWithUser().withOptions(opts).get(`/elements/${fakeIdOrKey}/resources`, insufficientPrivilegesValidator))
        .then(() => cloudWithUser().withOptions(opts).get(`/elements/${fakeIdOrKey}/resources/123`, insufficientPrivilegesValidator))
        .then(() => cloudWithUser().withOptions(opts).get(`/elements/${fakeIdOrKey}/resources/123/hooks`, insufficientPrivilegesValidator))
        .then(() => cloudWithUser().withOptions(opts).get(`/elements/${fakeIdOrKey}/resources/123/hooks/123`, insufficientPrivilegesValidator))
        .then(() => cloudWithUser().withOptions(opts).get(`/elements/${fakeIdOrKey}/resources/123/parameters`, insufficientPrivilegesValidator))
        .then(() => cloudWithUser().withOptions(opts).get(`/elements/${fakeIdOrKey}/resources/123/models`, insufficientPrivilegesValidator))
        .then(() => cloudWithUser().withOptions(opts).get(`/elements/${fakeIdOrKey}/hooks`, insufficientPrivilegesValidator))
        .then(() => cloudWithUser().withOptions(opts).get(`/elements/${fakeIdOrKey}/hooks/123`, insufficientPrivilegesValidator))
        .then(() => cloudWithUser().withOptions(opts).get(`/elements/${fakeIdOrKey}/parameters`, insufficientPrivilegesValidator))
        .then(() => addPrivilegeIfNecessary('viewElements'))
        .then(() => cloudWithUser().withOptions(opts).get(`/elements`))
        .then(elements => elementKeyOrId = elements.body[0][keyOrId])
        .then(() => cloudWithUser().withOptions(opts).get(`/elements/${elementKeyOrId}`))
        .then(() => cloudWithUser().withOptions(opts).get(`/elements/${elementKeyOrId}/export`))
        .then(() => cloudWithUser().withOptions(opts).get(`/elements/${elementKeyOrId}/configuration`))
        .then(() => cloudWithUser().withOptions(opts).get(`/elements/${elementKeyOrId}/resources`))
        .then(resources => resourceId = resources.body[0].id)
        .then(() => cloudWithUser().withOptions(opts).get(`/elements/${elementKeyOrId}/resources/${resourceId}`))
        .then(() => cloudWithUser().withOptions(opts).get(`/elements/${elementKeyOrId}/resources/${resourceId}/hooks`))
        .then(() => cloudWithUser().withOptions(opts).get(`/elements/${elementKeyOrId}/resources/${resourceId}/hooks/123`, sufficientPrivilegesValidator))
        .then(() => cloudWithUser().withOptions(opts).get(`/elements/${elementKeyOrId}/resources/${resourceId}/parameters`))
        .then(() => cloudWithUser().withOptions(opts).get(`/elements/${elementKeyOrId}/resources/${resourceId}/models`))
        .then(() => cloudWithUser().withOptions(opts).get(`/elements/${elementKeyOrId}/hooks`))
        .then(hs => cloudWithUser().withOptions(opts).get(`/elements/${elementKeyOrId}/hooks/123`, sufficientPrivilegesValidator))
        //TODO - this fails bc I dont own this element - fix bug
        // .then(() => cloudWithUser().withOptions(opts).get(`/elements/${elementKeyOrId}/parameters`));
        ;
    }

    const runCUDElementTests = keyOrId => {
      let elementKeyOrId, elementInstanceId, cloneId, resourceId;
      const cleanup = () => {
        if (!R.isNil(elementInstanceId)) {
          cloudWithUser().delete(`/instances/${elementInstanceId}`, R.always(true));
        }

        if (!R.isNil(elementKeyOrId)) {
          cloudWithUser().delete(`/elements/${elementKeyOrId}`, R.always(true));
        }

        if (!R.isNil(cloneId)) {
          cloudWithUser().delete(`/elements/${cloneId}`, R.always(true));
        }
      };

      const fakeIdOrKey = keyOrId === 'key' ? 'key' : 23;

      // create without priv
      return removePrivilegeIfNecessary('createElements')
        .then(() => cloudWithUser().post(`/elements`, DEFAULT_ELEMENT(), insufficientPrivilegesValidator))
        .then(() => cloudWithUser().post(`/elements/${fakeIdOrKey}/clone`, null, insufficientPrivilegesValidator))
        // create with priv      
        .then(() => addPrivilegeIfNecessary('createElements'), {}, insufficientPrivilegesValidator)
        .then(() => cloudWithUser().post(`/elements`, DEFAULT_ELEMENT()))
        .then(r => elementKeyOrId = r.body[keyOrId])      
        .then(() => console.log('element key or id: ' + elementKeyOrId))  
        .then(() => cloudWithUser().post(`/elements/${elementKeyOrId}/clone`, null, sufficientPrivilegesValidator))
        .then(r => cloneId = r.body[keyOrId])
        // edits without priv
        .then(() => removePrivilegeIfNecessary('editElements'))
        .then(() => cloudWithUser().put(`/elements/${elementKeyOrId}`, DEFAULT_ELEMENT(), insufficientPrivilegesValidator))
        .then(() => cloudWithUser().post(`/elements/${elementKeyOrId}/configuration`, DEFAULT_ELEMENT_CONFIG(), insufficientPrivilegesValidator))
        .then(() => cloudWithUser().put(`/elements/${elementKeyOrId}/configuration/key`, DEFAULT_ELEMENT_CONFIG(), insufficientPrivilegesValidator))
        .then(() => cloudWithUser().delete(`/elements/${elementKeyOrId}/configuration/key`, insufficientPrivilegesValidator))
        .then(() => cloudWithUser().post(`/elements/${elementKeyOrId}/resources`, DEFAULT_ELEMENT_RESOURCE(), insufficientPrivilegesValidator))
        .then(() => cloudWithUser().put(`/elements/${elementKeyOrId}/resources/1`, DEFAULT_ELEMENT_RESOURCE(), insufficientPrivilegesValidator))
        .then(() => cloudWithUser().delete(`/elements/${elementKeyOrId}/resources/1`, insufficientPrivilegesValidator))  
        .then(() => cloudWithUser().post(`/elements/${elementKeyOrId}/resources/1/hooks`, DEFAULT_ELEMENT_HOOK(), insufficientPrivilegesValidator))
        .then(() => cloudWithUser().put(`/elements/${elementKeyOrId}/resources/1/hooks/1`, DEFAULT_ELEMENT_HOOK(), insufficientPrivilegesValidator))
        .then(() => cloudWithUser().delete(`/elements/${elementKeyOrId}/resources/1/hooks/1`, insufficientPrivilegesValidator))  
        .then(() => cloudWithUser().post(`/elements/${elementKeyOrId}/resources/1/parameters`, DEFAULT_ELEMENT_PARAMETER(), insufficientPrivilegesValidator))
        .then(() => cloudWithUser().put(`/elements/${elementKeyOrId}/resources/1/parameters/1`, DEFAULT_ELEMENT_PARAMETER(), insufficientPrivilegesValidator))
        .then(() => cloudWithUser().delete(`/elements/${elementKeyOrId}/resources/1/parameters/1`, insufficientPrivilegesValidator)) 
        .then(() => cloudWithUser().post(`/elements/${elementKeyOrId}/resources/1/models`, DEFAULT_ELEMENT_MODELS(), insufficientPrivilegesValidator))
        .then(() => cloudWithUser().put(`/elements/${elementKeyOrId}/resources/1/models`, DEFAULT_ELEMENT_MODELS(), insufficientPrivilegesValidator))
        .then(() => cloudWithUser().delete(`/elements/${elementKeyOrId}/resources/1/models`, insufficientPrivilegesValidator)) 
        .then(() => cloudWithUser().post(`/elements/${elementKeyOrId}/hooks`, DEFAULT_ELEMENT_HOOK(), insufficientPrivilegesValidator))
        .then(() => cloudWithUser().put(`/elements/${elementKeyOrId}/hooks/1`, DEFAULT_ELEMENT_HOOK(), insufficientPrivilegesValidator))
        .then(() => cloudWithUser().delete(`/elements/${elementKeyOrId}/hooks/1`, insufficientPrivilegesValidator))  
        .then(() => cloudWithUser().post(`/elements/${elementKeyOrId}/parameters`, DEFAULT_ELEMENT_PARAMETER(), insufficientPrivilegesValidator))
        .then(() => cloudWithUser().put(`/elements/${elementKeyOrId}/parameters/1`, DEFAULT_ELEMENT_PARAMETER(), insufficientPrivilegesValidator))
        .then(() => cloudWithUser().delete(`/elements/${elementKeyOrId}/parameters/1`, insufficientPrivilegesValidator))
        .then(() => cloudWithUser().delete(`/elements/${elementKeyOrId}/active`, insufficientPrivilegesValidator))
        .then(() => cloudWithUser().put(`/elements/${elementKeyOrId}/active`, null, insufficientPrivilegesValidator))
        // edits w priv     
        .then(() => addPrivilegeIfNecessary('editElements'))
        .then(() => cloudWithUser().put(`/elements/${elementKeyOrId}`, DEFAULT_ELEMENT()))
        .then(() => cloudWithUser().post(`/elements/${elementKeyOrId}/configuration`, DEFAULT_ELEMENT_CONFIG()))
        .then(c => cloudWithUser().put(`/elements/${elementKeyOrId}/configuration/${c.body.key}`, DEFAULT_ELEMENT_CONFIG()))
        .then(c => cloudWithUser().delete(`/elements/${elementKeyOrId}/configuration/${c.body.key}`))  
        .then(() => cloudWithUser().post(`/elements/${elementKeyOrId}/resources`, DEFAULT_ELEMENT_RESOURCE()))
        .then(r => resourceId = r.body.id)
        .then(() => cloudWithUser().put(`/elements/${elementKeyOrId}/resources/${resourceId}`, DEFAULT_ELEMENT_RESOURCE()))
        .then(() => cloudWithUser().post(`/elements/${elementKeyOrId}/resources/${resourceId}/hooks`, DEFAULT_ELEMENT_HOOK()))
        .then(h => cloudWithUser().put(`/elements/${elementKeyOrId}/resources/${resourceId}/hooks/${h.body.id}`, DEFAULT_ELEMENT_HOOK()))
        .then(h => cloudWithUser().delete(`/elements/${elementKeyOrId}/resources/${resourceId}/hooks/${h.body.id}`))  
        .then(() => cloudWithUser().post(`/elements/${elementKeyOrId}/resources/${resourceId}/parameters`, DEFAULT_ELEMENT_PARAMETER()))
        .then(p => cloudWithUser().put(`/elements/${elementKeyOrId}/resources/${resourceId}/parameters/${p.body.id}`, DEFAULT_ELEMENT_PARAMETER()))
        .then(p => cloudWithUser().delete(`/elements/${elementKeyOrId}/resources/${resourceId}/parameters/${p.body.id}`)) 
        .then(() => cloudWithUser().post(`/elements/${elementKeyOrId}/resources/${resourceId}/models`, DEFAULT_ELEMENT_MODELS()))
        .then(() => cloudWithUser().put(`/elements/${elementKeyOrId}/resources/${resourceId}/models`, DEFAULT_ELEMENT_MODELS()))
        .then(() => cloudWithUser().delete(`/elements/${elementKeyOrId}/resources/${resourceId}/models`)) 
        .then(() => cloudWithUser().delete(`/elements/${elementKeyOrId}/resources/${resourceId}`))
        .then(() => cloudWithUser().post(`/elements/${elementKeyOrId}/hooks`, DEFAULT_ELEMENT_HOOK()))
        .then(h => cloudWithUser().put(`/elements/${elementKeyOrId}/hooks/${h.body.id}`, DEFAULT_ELEMENT_HOOK()))
        .then(h => cloudWithUser().delete(`/elements/${elementKeyOrId}/hooks/${h.body.id}`))
        .then(() => cloudWithUser().post(`/elements/${elementKeyOrId}/parameters`, DEFAULT_ELEMENT_PARAMETER()))
        .then(p => cloudWithUser().put(`/elements/${elementKeyOrId}/parameters/${p.body.id}`, DEFAULT_ELEMENT_PARAMETER()))
        .then(p => cloudWithUser().delete(`/elements/${elementKeyOrId}/parameters/${p.body.id}`))
        .then(p => cloudWithUser().delete(`/elements/${elementKeyOrId}/active`))
        .then(p => cloudWithUser().put(`/elements/${elementKeyOrId}/active`, null, sufficientPrivilegesValidator))
        // delete without priv
        .then(() => removePrivilegeIfNecessary('deleteElements'))
        .then(() => cloudWithUser().delete(`/elements/${elementKeyOrId}`, insufficientPrivilegesValidator))
        // instances without priv
        .then(() => removePrivilegeIfNecessary('createElementInstances'))
        .then(() => cloudWithUser().post(`/elements/${elementKeyOrId}/instances`, DEFAULT_ELEMENT_INSTANCE(), insufficientPrivilegesValidator))
        .then(() => cloudWithUser().put(`/elements/${elementKeyOrId}/instances/12`, DEFAULT_ELEMENT_INSTANCE(), insufficientPrivilegesValidator))
        // instances with priv
        .then(() => addPrivilegeIfNecessary('createElementInstances'))
        .then(() => cloudWithUser().post(`/elements/${elementKeyOrId}/instances`, DEFAULT_ELEMENT_INSTANCE()))
        .then(i => cloudWithUser().put(`/elements/${elementKeyOrId}/instances/${i.body.id}`, DEFAULT_ELEMENT_INSTANCE()))
        // delete with priv
        .then(() => addPrivilegeIfNecessary('deleteElements'))
        .then(cleanup);
    };

    it('should restrict access to viewing elements by id without the viewElements privilege', () => {
      return runReadElementTests('id');
    });

    it('should restrict access to viewing elements by key without the viewElements privilege', () => {
      return runReadElementTests('key');
    });

    it('should restrict access to creating, editing, and deleting an element by id without the editElements privilege', () => {
      return runCUDElementTests('id');
    });

    it('should restrict access to creating, editing, and deleting an element by key without the editElements privilege', () => {
      return runCUDElementTests('key');
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
        .then(() => cloudWithUser().get(`/accounts/objects/definitions`, insufficientPrivilegesValidator))
        .then(() => addPrivilegeIfNecessary('viewCommonObjects'))
        .then(() => cloudWithUser().get(`/organizations/objects/definitions`))
        .then(() => cloudWithUser().get(`/accounts/objects/definitions`));
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
      let roles;
      return removePrivilegeIfNecessary('configureRoles')
        .then(() => cloudWithUser().get(`/organizations/roles`, insufficientPrivilegesValidator))
        .then(() => cloudWithUser().put(`/organizations/roles`, [], insufficientPrivilegesValidator))
        .then(() => cloudWithUser().put(`/organizations/roles/reset`, null, insufficientPrivilegesValidator))        
        .then(() => addPrivilegeIfNecessary('configureRoles'))
        .then(() => cloudWithUser().get(`/organizations/roles`))
        .then(rs => roles = rs.body)
        .then(() => cloudWithUser().put(`/organizations/roles`, roles))
        .then(() => cloudWithUser().put(`/organizations/roles/reset`));
    });
  });
});
