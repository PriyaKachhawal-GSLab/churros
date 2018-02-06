'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const chakram = require('chakram');
const expect = chakram.expect;

const genCommit = (type, id, m) => {
    return {
        entityType: type,
        entityId: id,
        message: m
    };
};

suite.forPlatform('change-management/commits', {payload: genCommit('model', 1, 'crud test')}, test => {

  test.withOptions({churros: {updatePayload: {message: 'updated message'}}}).should.supportCrud();

  it('should support searching by a date range and user', () => {
    const validator = (r, num) => {
      expect(r).to.have.statusCode(200);
      expect(r.body.length).to.equal(num);
    };

    let commits = [];
    let deletes = [];
    let startDate, endDate;

    return cloud.post('/change-management/commits', genCommit('model', 2, 'first'))
        .then(r => {
            startDate = r.body.createdDate;
            commits.push(r.body);
        })
        .then(() => cloud.post('/change-management/commits', genCommit('model', 2, 'second')))
        .then(r => commits.push(r.body))
        .then(() => cloud.post('/change-management/commits', genCommit('model', 3, 'a diff model')))
        .then(r => commits.push(r.body))
        .then(() => cloud.post('/change-management/commits', genCommit('element', 1, 'oh snap, thats not a model commit')))
        .then(r => {
            endDate = r.body.createdDate;
            commits.push(r.body);
        })
        .then(() => cloud.post('/change-management/commits', genCommit('model', 2, 'another but after the end time')))
        .then(r => commits.push(r.body))
        .then(() => cloud.get(`/change-management/commits?entityType=model&entityId=2&to=${endDate}&from=${startDate}`, r => validator(r, 2)))
        .then(() => cloud.get(`/change-management/commits?entityType=model&entityId=2&from=${startDate}`, r => validator(r, 3)))
        .then(() => cloud.get(`/change-management/commits?entityType=element&entityId=1&from=${startDate}`, r => validator(r, 1)))
        .then(() => commits.forEach(c => deletes.push(cloud.delete(`/change-management/commits/${c.id}`))))
        .then(() => chakram.all(deletes));
  });

});
