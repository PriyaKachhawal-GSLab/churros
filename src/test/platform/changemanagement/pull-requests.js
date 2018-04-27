'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const defaults = require('core/defaults');
const tools = require('core/tools');
const chakram = require('chakram');
const modelPayload = require('core/tools').requirePayload(`${__dirname}/assets/elementmodel.json`);

const expect = chakram.expect;
const R = require('ramda');

const crudsObject = (url, payload, updatePayload) => {
  let object;
  return cloud.post(url, payload)
    .then(r => object = r.body)
    .then(r => cloud.get(url + '/' + object.id))
    .then(r => cloud.patch(url + '/' + object.id, updatePayload))
    .then(r => cloud.delete(url + '/' + object.id));
};

const genPr = (type, id, message, deletionRequest) => {
    return {
        entityType: type,
        entityId: id,
        message,
        deletionRequest
    };
};

const genCommit = (type, id, m) => {
    return {
        entityType: type,
        entityId: id,
        message: m
    };
};

suite.forPlatform('change-management/pull-requests', {payload: genPr('model', 1, 'message', false)}, test => {
    let newUser, elementId, modelId, modelName, resource;
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
            resource = R.head(r.body.resources);
          }
        )
        .then(r => cloud.withOptions({ headers: { Authorization: `User ${newUser.secret}, Organization ${defaults.secrets().orgSecret}` } }).post(`elements/${elementId}/models`, Object.assign({}, modelPayload, {resources:[resource]})))
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

  it('should support CRUD for pull requests', () => crudsObject('change-management/pull-requests', genPr('model', modelId, 'message', false), {status: 'cancelled'}));

  it('should support searching by a status', () => {
    const validatorAll = (r, num) => {
        expect(r).to.have.statusCode(200);
        expect(r.body.length >= num).to.equal(true);
    };

    const validator = (r, status) => {
        expect(r).to.have.statusCode(200);
        r.body.forEach(pr => {
            expect(pr.status).to.equal(status);
        });
    };

    const validatorOr = (r, status1, status2) => {
        expect(r).to.have.statusCode(200);
        r.body.forEach(pr => {
            expect(pr.status === status1 || pr.status === status2).to.equal(true);
        });
    };

    let prs = [];
    let deletes = [];


    return cloud.post('/change-management/pull-requests', genPr('model', modelId, 'first', false))
        .then(r => cloud.patch(`/change-management/pull-requests/${r.body.id}`, {status: 'readyForReview'}))
        .then(r => prs.push(r.body))
        .then(() => cloud.post('/change-management/pull-requests', genPr('model', modelId, 'second', false)))
        .then(r => cloud.patch(`/change-management/pull-requests/${r.body.id}`, {status: 'cancelled'}))
        .then(r => prs.push(r.body))
        .then(() => cloud.post('/change-management/pull-requests', genPr('model', modelId, 'third', false)))
        .then(r => prs.push(r.body))
        .then(() => cloud.post('/change-management/pull-requests', genPr('model', modelId, 'fourth', false)))
        .then(r => prs.push(r.body))
        .then(() => cloud.get(`/change-management/pull-requests?statuses%5B%5D=created`, r => validator(r, 'created')))
        .then(() => cloud.get(`/change-management/pull-requests?statuses%5B%5D=readyForReview%2C%20cancelled`, r => validatorOr(r, 'readyForReview', 'cancelled')))
        .then(() => cloud.get(`/change-management/pull-requests`, r => validatorAll(r, 4)))
        .then(() => prs.forEach(p => deletes.push(cloud.delete(`/change-management/pull-requests/${p.id}`))))
        .then(() => chakram.all(deletes));
  });

  // NOTE: can only be run as a superModelAdmin
  it.skip('should support approving a PR made by another user and searching for other users PRs as a super model admin', () => {
    const validator = (r, status) => {
        expect(r).to.have.statusCode(200);
        expect(r.body.length > 0).to.equal(true);
        r.body.forEach(pr => {
            expect(pr.status).to.equal(status);
        });
    };

    let prId;

    return cloud.withOptions({ headers: { Authorization: `User ${newUser.secret}, Organization ${defaults.secrets().orgSecret}` } }).post('/change-management/pull-requests', genPr('model', modelId, 'first', false))
        .then(r => cloud.patch(`/change-management/pull-requests/${r.body.id}`, {status: 'approved'}))
        .then(r => prId = r.body.id)
        .then(() => cloud.get(`/change-management/pull-requests?statuses%5B%5D=approved`, r => validator(r, 'approved')))
        .then(() => cloud.delete(`/change-management/pull-requests/${prId}`));
  });

  // NOTE: can only be run with qaApprovePullRequest privileges
  it.skip('should support approving a PR as a QA user', () => {
    let prId;
    const validator = (r) => {
        expect(r).to.have.statusCode(200);
        expect(r.body.qaApproved).to.equal(true);
        return r;
    };

    return cloud.withOptions({ headers: { Authorization: `User ${newUser.secret}, Organization ${defaults.secrets().orgSecret}` } }).post('/change-management/pull-requests', genPr('model', modelId, 'first', false))
        .then(r => cloud.patch(`/change-management/pull-requests/${r.body.id}`, {qaApproved: true}, r => validator(r)))
        .then(r => prId = r.body.id)
        .then(r => cloud.withOptions({ headers: { Authorization: `User ${newUser.secret}, Organization ${defaults.secrets().orgSecret}` } }).patch(`/change-management/pull-requests/${prId}`, {qaApproved: true}, r => expect(r).to.have.statusCode(403)))
        .then(() => cloud.delete(`/change-management/pull-requests/${prId}`));
  });


  // NOTE: can only be run with qaApprovePullRequest privileges
  it.skip('should support cloning an entity for testing as a QA user', () => {
    let prId, qaModelId;
    const validator = (r) => {
        expect(r.body.filter(model => model.isQa)).to.have.length(1);
    };

    return cloud.withOptions({ headers: { Authorization: `User ${newUser.secret}, Organization ${defaults.secrets().orgSecret}` } }).post('/change-management/pull-requests', genPr('model', modelId, 'first', false))
        .then(r => prId = r.body.id)
        .then(r => cloud.post(`/change-management/pull-requests/${prId}/clonedEntity`, {})
        .then(r => cloud.get(`/elements/${elementId}/models`), r => validator(r)))
        .then(r => {
          qaModelId = R.head(r.body.filter(model => model.isQA)).id;
        })
        .then(r => cloud.delete(`/elements/${elementId}/models/${qaModelId}`))
        .then(() => cloud.delete(`/change-management/pull-requests/${prId}`));
  });

  // NOTE: can only be run as a superModelAdmin
  it.skip('should return a hydrated diff of the entity on GET', () => {
    const validator = (r) => {
      expect(r).to.have.statusCode(200);
      expect(r.body).to.have.ownProperty('originalVersion');
      expect(r.body).to.have.ownProperty('newVersion');
      const newVersion = JSON.parse(r.body.newVersion);
      expect(newVersion).to.have.ownProperty('resources');
      //validate that the resource has been associated
      expect(newVersion.resources).to.have.length(1);
    };

    let prId;

    return cloud.withOptions({ headers: { Authorization: `User ${newUser.secret}, Organization ${defaults.secrets().orgSecret}` } }).post('/change-management/pull-requests', genPr('model', modelId, 'first', false))
        .then(r => prId = r.body.id)
        .then(() => cloud.withOptions({qs:{hydrateDiff:true}}).get(`/change-management/pull-requests/${prId}`, r => validator(r)))
        .then(() => cloud.delete(`/change-management/pull-requests/${prId}`));
  });

  // NOTE: can only be run as a superModelAdmin
  it.skip('should support merging PRs for creating, updating and deleting models from the catalog', () => {
    const mergeValidator = r => {
        expect(r).to.have.statusCode(200);
        expect(r.body.status).to.equal('merged');
    };

    const mergeValidator2 = r => {
        expect(r).to.have.statusCode(200);
        expect(r.body.status).to.equal('merged');
        expect(R.contains('element-closeio-account-system-model', r.body.systemEntityReference)).to.be.true;
    };

    let prId, prId2, prId3, modelId2, sysModel;

    return cloud.withOptions({ headers: { Authorization: `User ${newUser.secret}, Organization ${defaults.secrets().orgSecret}` } }).post('/change-management/commits',  genCommit('model', modelId, 'commit msg'))
        .then(() => cloud.withOptions({ headers: { Authorization: `User ${newUser.secret}, Organization ${defaults.secrets().orgSecret}` } }).post('/change-management/pull-requests', genPr('model', modelId, 'first', false)))
        .then(r => cloud.put(`/change-management/pull-requests/${r.body.id}/merge`, null, mergeValidator))
        .then(r => prId = r.body.id)
        .then(r => cloud.withOptions({ headers: { Authorization: `User ${newUser.secret}, Organization ${defaults.secrets().orgSecret}` } }).get(`elements/${elementId}/models/${modelId}`, r => expect(r).to.have.statusCode(404)))
        .then(r => cloud.withOptions({ headers: { Authorization: `User ${newUser.secret}, Organization ${defaults.secrets().orgSecret}` } }).post(`elements/${elementId}/models`, modelPayload))
        .then(r => {
            modelId2 = r.body.id;
        })
        .then(r => cloud.withOptions({ headers: { Authorization: `User ${newUser.secret}, Organization ${defaults.secrets().orgSecret}` } }).post('/change-management/pull-requests', genPr('model', modelId2, 'second', false)))
        .then(r => cloud.put(`/change-management/pull-requests/${r.body.id}/merge`, null, mergeValidator2))
        .then(r => prId2 = r.body.id)
        .then(r => cloud.get(`elements/${elementId}/models`))
        .then(r => {
            sysModel = R.head(R.filter(R.propEq('name', modelName), r.body));
        })
        .then(r => cloud.get(`/change-management/commits?entityType=model&entityId=${sysModel.id}`, r => expect(r.body.length > 0).to.be.true))
        // Note that this deletion request needs to be made by an admin
        .then(r => cloud.post('/change-management/pull-requests', genPr('model', sysModel.id, 'delete req', true)))
        .then(r => prId3 = r.body.id)
        .then(r => cloud.put(`/change-management/pull-requests/${prId3}/merge`, null, mergeValidator2))
        .then(r => cloud.get(`elements/${elementId}/models/${sysModel.id}`, r => expect(r).to.have.statusCode(404)))
        .then(() => cloud.delete(`/change-management/pull-requests/${prId}`))
        .then(() => cloud.delete(`/change-management/pull-requests/${prId2}`))
        .then(() => cloud.delete(`/change-management/pull-requests/${prId3}`));
    });
});
