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

const genPr = (type, id, status) => {
    return {
        entityType: type,
        entityId: id,
        message: 'message',
        diffReference: '/path/to/diff'
    };
};

suite.forPlatform('change-management/pull-requests', {payload: genPr('model', 1)}, test => {
    let newUser, elementId, modelId;
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
        .then(r => elementId = r.body.id)
        .then(r => cloud.withOptions({ headers: { Authorization: `User ${newUser.secret}, Organization ${defaults.secrets().orgSecret}` } }).post(`elements/${elementId}/models`, modelPayload))
        .then(r => {
          modelId = r.body.id;
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

    
//   test.withOptions({churros: {updatePayload: {status: 'cancelled'}}}).should.supportCrud();

  it('should support CRUD for pull requests', () => crudsObject('change-management/pull-requests', genPr('model', modelId), {status: 'cancelled'}));


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


    return cloud.post('/change-management/pull-requests', genPr('model', modelId, 'first'))
        .then(r => cloud.patch(`/change-management/pull-requests/${r.body.id}`, {status: 'readyForReview'}))
        .then(r => prs.push(r.body))
        .then(() => cloud.post('/change-management/pull-requests', genPr('model', modelId, 'second')))
        .then(r => cloud.patch(`/change-management/pull-requests/${r.body.id}`, {status: 'cancelled'}))
        .then(r => prs.push(r.body))
        .then(() => cloud.post('/change-management/pull-requests', genPr('model', modelId, 'third')))
        .then(r => prs.push(r.body))
        .then(() => cloud.post('/change-management/pull-requests', genPr('model', modelId, 'fourth')))
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
  
    return cloud.withOptions({ headers: { Authorization: `User ${newUser.secret}, Organization ${defaults.secrets().orgSecret}` } }).post('/change-management/pull-requests', genPr('model', 2, 'first'))
        .then(r => cloud.patch(`/change-management/pull-requests/${r.body.id}`, {status: 'approved'}))
        .then(r => prId = r.body.id)
        .then(() => cloud.get(`/change-management/pull-requests?statuses%5B%5D=approved`, r => validator(r, 'approved')))
        .then(() => cloud.delete(`/change-management/pull-requests/${prId}`));
  });

    // NOTE: can only be run as a superModelAdmin
    it.skip('should support merging a PR', () => {   
        const mergeValidator = r => {
            expect(r).to.have.statusCode(200);
            expect(r.body.status).to.equal('merged');
        };
      
        let prId;
      
        return cloud.withOptions({ headers: { Authorization: `User ${newUser.secret}, Organization ${defaults.secrets().orgSecret}` } }).post('/change-management/pull-requests', genPr('model', modelId, 'first'))
            .then(r => cloud.put(`/change-management/pull-requests/${r.body.id}/merge`, null, mergeValidator))
            .then(r => prId = r.body.id)
            .then(r => cloud.withOptions({ headers: { Authorization: `User ${newUser.secret}, Organization ${defaults.secrets().orgSecret}` } }).get(`elements/${elementId}/models/${modelId}`, r => expect(r).to.have.statusCode(404)))
            .then(() => cloud.delete(`/change-management/pull-requests/${prId}`));
      });
});
