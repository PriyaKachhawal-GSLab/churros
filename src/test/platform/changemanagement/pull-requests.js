'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const chakram = require('chakram');
const expect = chakram.expect;

const genPr = (type, id, status) => {
    return {
        entityType: type,
        entityId: id,
        message: 'message',
        diffReference: '/path/to/diff',
    };
};

suite.forPlatform('change-management/pull-requests', {payload: genPr('model', 1)}, test => {

  test.withOptions({churros: {updatePayload: {status: 'changesRequested'}}}).should.supportCrud();

  it('should support searching by a status as a super user', () => {
    const validator = (r, num) => {
        expect(r).to.have.statusCode(200);
        expect(r.body.length).to.equal(num);
      };
  
      let prs = [];
      let deletes = [];
      let startDate, endDate;
  
      return cloud.post('/change-management/pull-requests', genPr('model', 2, 'first'))
        .then(r => cloud.patch(`/change-management/pull-requests/${r.body.id}`, {status: 'changesRequested'}))
        .then(r => prs.push(r.body))
        .then(() => cloud.post('/change-management/pull-requests', genPr('model', 2, 'second')))
        .then(r => cloud.patch(`/change-management/pull-requests/${r.body.id}`, {status: 'declined'}))
        .then(r => prs.push(r.body))
        .then(() => cloud.post('/change-management/pull-requests', genPr('model', 2, 'third')))
        .then(r => prs.push(r.body))
        .then(() => cloud.post('/change-management/pull-requests', genPr('model', 2, 'fourth')))
        .then(r => prs.push(r.body))
        .then(() => cloud.get(`/change-management/pull-requests?statuses%5B%5D=created`, r => validator(r, 2)))
        .then(() => cloud.get(`/change-management/pull-requests?statuses%5B%5D=changesRequested%2C%20declined`, r => validator(r, 2)))
        .then(() => cloud.get(`/change-management/pull-requests`, r => validator(r, 4)))
        .then(() => prs.forEach(p => deletes.push(cloud.delete(`/change-management/pull-requests/${p.id}`))))
        .then(() => chakram.all(deletes));
  });

  it('should support updating the status as a super user', () => {
    const validator = (r, num) => {
        expect(r).to.have.statusCode(200);
        expect(r.body.length).to.equal(num);
      };
  
      let prs = [];
      let deletes = [];
  
      return ;
    });

});
