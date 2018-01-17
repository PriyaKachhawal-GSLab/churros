'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const defaults = require('core/defaults');
const expect = require('chai').expect;

suite.forPlatform('visibility', (test) => {
  let subAccountOne;
  let subAccountTwo;
  let userOne;
  let userTwo;
  let userThree;

  const cloudAsUser = (user) => {
    const orgSecret = defaults.secrets().orgSecret;
    return user ? cloud.withOptions({headers:{authorization: `User ${user.secret}, Organization ${orgSecret}`}}) : cloud;
  };

  const deleteEntity = (name, nameKey, uri, user) => {
    return cloudAsUser(user).withOptions({qs: {where: `${nameKey}='${name}'`}}).get(uri)
      .then(r => Promise.all(r.body.filter(entity => entity[nameKey] === name)
        .map(entity => cloudAsUser(user).delete(`${uri}/${entity.id}`))), () => true);
  };

  const createEntity = (name, nameKey, uri, postUri, entity, user) => {
    return deleteEntity(name, nameKey, uri)
      .then(() => cloudAsUser(user).post(postUri, entity))
      .then(r => r.body);
  };

  const createAccount = accountName => {
    return createEntity(accountName, 'externalId', '/accounts', '/accounts', {externalId: accountName});
  };

  const deleteAccount = accountName => {
    return deleteEntity(accountName, 'externalId', '/accounts');
  };

  const createUser = (userEmail, account) => {
    return createEntity(
      userEmail,
      'email',
      '/users',
      `/accounts/${account.id}/users`,
      {email: userEmail,firstName: 'test',lastName: 'user',password: 'Password123!'});
  };

  const deleteUser = (userEmail) => {
    return deleteEntity(userEmail, 'email', '/users');
  };

  const createFormula = (formulaName, user) => {
    return createEntity(formulaName, 'name', '/formulas', '/formulas', {name: formulaName}, user);
  };

  const deleteFormula = (formulaName, user) => {
    return deleteEntity(formulaName, 'name', '/formulas', user);
  };

  before(() => {
    return createAccount('churros-subaccount-one')
      .then(r => subAccountOne = r)
      .then(() => createAccount('churros-subaccount-two'))
      .then(r => subAccountTwo = r)
      .then(() => createUser('churros-subaccount-one-user-one@ce.com', subAccountOne))
      .then(r => userOne = r)
      .then(() => createUser('churros-subaccount-two-user-one@ce.com', subAccountTwo))
      .then(r => userTwo = r)
      .then(() => createUser('churros-subaccount-two-user-two@ce.com', subAccountTwo))
      .then(r => userThree = r)
      .then(() => createFormula('churros-admin-formula'))
      .then(() => createFormula('churros-subaccount-one-user-one-formula', userOne))
      .then(() => createFormula('churros-subaccount-two-user-one-formula', userTwo))
      .then(() => createFormula('churros-subaccount-two-user-two-formula', userThree));
  });

  after(() => {
    return deleteFormula('churros-subaccount-two-user-two-formula', userThree)
      .then(() => deleteFormula('churros-subaccount-two-user-one-formula', userTwo))
      .then(() => deleteFormula('churros-subaccount-one-user-one-formula', userOne))
      .then(() => deleteFormula('churros-admin-formula'))
      .then(() => deleteUser('churros-subaccount-two-user-two@ce.com'))
      .then(() => deleteUser('churros-subaccount-two-user-one@ce.com'))
      .then(() => deleteUser('churros-subaccount-one-user-one@ce.com'))
      .then(() => deleteAccount('churros-subaccount-two'))
      .then(() => deleteAccount('churros-subaccount-one'));
  });

  it('should allow admin users to see all subaccount formulas', () => {
    return cloud.get('/formulas')
      .then(r => expect(r.body.map(formula => formula.name)).to.include.members(
        ['churros-subaccount-one-user-one-formula',
          'churros-subaccount-two-user-one-formula',
          'churros-subaccount-two-user-two-formula']));
  });

  it('should allow admin users to see all main account formulas', () => {
    return cloud.get('/formulas')
      .then(r => expect(r.body.map(formula => formula.name)).to.include('churros-admin-formula'));
  });

  it('should allow a subaccount user to see their own formulas', () => {
    return cloudAsUser(userThree).get('/formulas')
      .then(r => expect(r.body.map(formula => formula.name)).to.include('churros-subaccount-two-user-two-formula'));
  });

  it('should allow a subaccount user to see formulas of other users in their own account', () => {
    return cloudAsUser(userThree).get('/formulas')
      .then(r => expect(r.body.map(formula => formula.name)).to.include('churros-subaccount-two-user-one-formula'));
  });

  it('should allow a subaccount user to see formulas of the admin user', () => {
    return cloudAsUser(userThree).get('/formulas')
      .then(r => expect(r.body.map(formula => formula.name)).to.include('churros-admin-formula'));
  });

  it('should not allow a subaccount user to see formulas of other users in other accounts', () => {
    return cloudAsUser(userThree).get('/formulas')
      .then(r => expect(r.body.map(formula => formula.name)).to.not.include('churros-subaccount-one-user-one-formula'));
  });
});
