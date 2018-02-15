'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const defaults = require('core/defaults');
const tools = require('core/tools');
const chakram = require('chakram');
const expect = chakram.expect;
const R = require('ramda');

const genPr = (type, id, status) => {
    return {
        entityType: type,
        entityId: id,
        message: 'message',
        diffReference: '/path/to/diff',
    };
};

suite.forPlatform('change-management/pull-requests', {payload: genPr('model', 1)}, test => {
    let newUser;
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
        });
    });
  
    after(() => {
      return cloud.delete(`/users/${newUser.id}`, R.always(true));
    });

    
  test.withOptions({churros: {updatePayload: {status: 'cancelled'}}}).should.supportCrud();

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
  
    return cloud.post('/change-management/pull-requests', genPr('model', 2, 'first'))
        .then(r => cloud.patch(`/change-management/pull-requests/${r.body.id}`, {status: 'readyForReview'}))
        .then(r => prs.push(r.body))
        .then(() => cloud.post('/change-management/pull-requests', genPr('model', 2, 'second')))
        .then(r => cloud.patch(`/change-management/pull-requests/${r.body.id}`, {status: 'cancelled'}))
        .then(r => prs.push(r.body))
        .then(() => cloud.post('/change-management/pull-requests', genPr('model', 2, 'third')))
        .then(r => prs.push(r.body))
        .then(() => cloud.post('/change-management/pull-requests', genPr('model', 2, 'fourth')))
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
});
