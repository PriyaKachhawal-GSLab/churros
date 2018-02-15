'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const chakram = require('chakram');
const modelPayload = require('core/tools').requirePayload(`${__dirname}/assets/elementmodel.json`);

const expect = chakram.expect;

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


suite.forPlatform('change-management/pull-requests', {}, test => {
  let elementId, modelId, payload;

  before(() => cloud.get(`elements/closeio`)
    .then(r => elementId = r.body.id)
    .then(r => cloud.post(`elements/${elementId}/models`, modelPayload))
    .then(r => {
      modelId = r.body.id;
    })
  );

  after(() => cloud.delete(`elements/${elementId}/models/${modelId}`));

  //test.withOptions({churros: {updatePayload: {status: 'changesRequested'}}}).should.supportCrud();

  it('should support CRUD for pull requests', () => crudsObject('change-management/pull-requests', genPr('model', modelId), {status: 'changesRequested'}));

  // NOTE: you must run this test as a user with the superModelAdmin privilege
  it.skip('should support searching by a status as a super user', () => {
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
        .then(r => cloud.patch(`/change-management/pull-requests/${r.body.id}`, {status: 'changesRequested'}))
        .then(r => prs.push(r.body))
        .then(() => cloud.post('/change-management/pull-requests', genPr('model', modelId, 'second')))
        .then(r => cloud.patch(`/change-management/pull-requests/${r.body.id}`, {status: 'declined'}))
        .then(r => prs.push(r.body))
        .then(() => cloud.post('/change-management/pull-requests', genPr('model', modelId, 'third')))
        .then(r => prs.push(r.body))
        .then(() => cloud.post('/change-management/pull-requests', genPr('model', modelId, 'fourth')))
        .then(r => prs.push(r.body))
        .then(() => cloud.get(`/change-management/pull-requests?statuses%5B%5D=created`, r => validator(r, 'created')))
        .then(() => cloud.get(`/change-management/pull-requests?statuses%5B%5D=changesRequested%2C%20declined`, r => validatorOr(r, 'changesRequested', 'declined')))
        .then(() => cloud.get(`/change-management/pull-requests`, r => validatorAll(r, 4)))
        .then(() => prs.forEach(p => deletes.push(cloud.delete(`/change-management/pull-requests/${p.id}`))))
        .then(() => chakram.all(deletes));
  });
});
