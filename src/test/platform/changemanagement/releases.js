'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const defaults = require('core/defaults');
const tools = require('core/tools');
const chakram = require('chakram');
const modelPayload = require('core/tools').requirePayload(`${__dirname}/assets/elementmodel.json`);

const expect = chakram.expect;
const R = require('ramda');


const genPr = (type, id, status) => {
    return {
        entityType: type,
        entityId: id,
        message: 'message'
    };
};

const genCommit = (type, id, m) => {
    return {
        entityType: type,
        entityId: id,
        message: m
    };
};

const genRelease = releaseId => {
    return {
        fromEnvironmentBaseUrl: defaults.getBaseUrl(),
        fromReleaseId: releaseId,
        fromHeaders: {
            Authorization: `User ${defaults.secrets().userSecret}, Organization ${defaults.secrets().orgSecret}`,
            'Content-Type': 'application/json'
        }
    };
};

suite.forPlatform('change-management/releases', {payload: genPr('model', 1)}, test => {
    let newUser, elementId, elementKey, modelId, modelName;
    before(() => {
      const opts = { qs: { where: 'defaultAccount=true' } };
      return cloud.withOptions(opts).get('/accounts')
        .then(r => {
          expect(r.body.length).to.equal(1);
          const user = { email: `churros+rbac${tools.random()}@churros.com`, firstName: 'frank', lastName: 'ricard', password: 'Bingobango1!' };
          return cloud.post(`/accounts/${r.body[0].id}/users`, user);
        })
        .then(r => {
          newUser = r.body;
        })
        .then(() => cloud.get(`elements/closeio`))
        .then(r => {
            elementId = r.body.id;
            elementKey = r.body.key;
        })
        .then(r => cloud.withOptions({ headers: { Authorization: `User ${newUser.secret}, Organization ${defaults.secrets().orgSecret}` } }).post(`elements/${elementId}/models`, modelPayload))
        .then(r => {
          modelId = r.body.id;
          modelName = r.body.name;
        });
    });
  
    after(() => {
        try {
            if (newUser) cloud.delete(`/users/${newUser.id}`, R.always(true));
            if (modelId) cloud.delete(`elements/${elementId}/models/${modelId}`);
        } catch (e) {
            // ignore as if we already merged the PR the model was deleted
            return;
        }
    });

  // NOTE: can only be run as a superModelAdmin
  it('should support creating an open release when a pr is merged and pushing that release to the next environment', () => {   
    const validator = (r, sysModel) => {
        expect(r).to.have.statusCode(200);
        expect(r.body.length > 0).to.be.true;
        const currentReleases = R.filter(r => R.and(R.propEq('entityKey', `${elementKey}|${modelName}`, r), R.propEq('isReleasedToNextEnvironment', false, r)), r.body);
        expect(currentReleases.length).to.equal(1);

    };
    
    let prId, prId2, sysModel, release1, release2;
    
    return cloud.withOptions({ headers: { Authorization: `User ${newUser.secret}, Organization ${defaults.secrets().orgSecret}` } }).post('/change-management/commits',  genCommit('model', modelId, 'commit msg'))
        .then(() => cloud.withOptions({ headers: { Authorization: `User ${newUser.secret}, Organization ${defaults.secrets().orgSecret}` } }).post('/change-management/pull-requests', genPr('model', modelId, 'first')))
        .then(r => cloud.put(`/change-management/pull-requests/${r.body.id}/merge`))
        .then(r => prId = r.body.id)
        .then(r => cloud.get(`elements/${elementId}/models`))
        .then(r => {
            sysModel = R.head(R.filter(R.propEq('name', modelName), r.body));
        })
        .then(r => cloud.get(`/change-management/releases?open=true`, r => validator(r, sysModel)))
        .then(r => {
            release1 = R.head(R.filter(R.propEq('entityId', sysModel.id), r.body));
        })
        .then(() => cloud.post(`/change-management/releases`, genRelease(release1.id)))
        .then(() => cloud.get(`/change-management/releases/${release1.id}`, r => expect(r.body.isReleasedToNextEnvironment).to.be.true))

        // doing the above release created another one, but since we're releasing to the same env for testing lets clean that up
        .then(r => cloud.get(`/change-management/releases?open=true`, r => validator(r, sysModel)))
        .then(r => {
            release2 = R.head(R.filter(r => R.and(R.propEq('entityId', sysModel.id, r), R.propEq('isReleasedToNextEnvironment', false, r)), r.body));
        })
        .then(() => cloud.delete(`/change-management/releases/${release2.id}`))

        // clean up that model we just published to the system catalog
        .then(r => cloud.post('/change-management/pull-requests', genPr('model', sysModel.id, 'delete req', true)))
        .then(r => prId2 = r.body.id)
        .then(r => cloud.put(`/change-management/pull-requests/${prId2}/merge`))

        .then(() => cloud.delete(`/change-management/pull-requests/${prId}`))
        .then(() => cloud.delete(`/change-management/pull-requests/${prId2}`))
        .then(() => cloud.delete(`/change-management/releases/${release1.id}`));
    });
});
