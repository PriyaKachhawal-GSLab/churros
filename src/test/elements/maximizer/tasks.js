'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const tools = require('core/tools');
const faker = require('faker');
const moment = require('moment');

const taskPayload = tools.requirePayload(`${__dirname}/assets/task.json`);
taskPayload.DateTime = moment().format();

suite.forElement('crm', 'tasks', (test) => {

  test.should.supportPagination();

  it('should allow CRUDS for /tasks', () => {
    let taskId;
    return cloud.post(test.api, taskPayload)
      .then(r => {
        taskId = r.body.Key;
        expect(r.body.Activity).to.equal(taskPayload.Activity);
      })
      .then(() => cloud.withOptions({ qs: { where: `Priority Like '${taskPayload.Priority}%'` } }).get(test.api))
      .then(r => expect(r.body[0].Priority).to.equal(taskPayload.Priority))
      .then(() => cloud.withOptions({ qs: { fields:`Activity,Creator,Priority` } }).get(test.api))
      .then(r => expect(Object.keys(r.body[0]).length).to.equal(3))
      .then(() => cloud.get(`${test.api}/${taskId}`))
      .then(() => taskPayload.Activity = faker.random.word())
      .then(() => cloud.patch(`${test.api}/${taskId}`, taskPayload))
      .then(r => expect(r.body.Activity).to.equal(taskPayload.Activity))
      .then(() => cloud.delete(`${test.api}/${taskId}`));
  });
});
