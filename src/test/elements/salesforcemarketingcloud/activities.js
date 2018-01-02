'use strict';

const suite = require('core/suite');
const payload = require('./assets/activities');
const cloud = require('core/cloud');
const tools = require('core/tools');
const expect = require('chakram').expect;
const build = (overrides) => Object.assign({}, payload, overrides);
const activitiesPayload = build({ key: tools.random() });
const updatePayload = {
  "key": activitiesPayload.key,
  "modifiedDate": "",
  "name": tools.random(),
  "version": 1,
  "description": tools.random(),
  "workflowApiVersion": 1.0
};
suite.forElement('marketing', 'activities', { payload: activitiesPayload }, (test) => {
  it('should allow CRD for /activities', () => {
    let activitiesId;
    return cloud.post(test.api, payload)
      .then(r => activitiesId = r.body.id)
      .then(r => cloud.get(`${test.api}/${activitiesId}`))
      .then(r => cloud.get(test.api))
      .then(r => cloud.delete(`${test.api}/${activitiesId}`))
      .then(r => cloud.post(test.api, activitiesPayload))
      .then(r => updatePayload.modifiedDate = r.body.modifiedDate)
      .then(r => cloud.put(test.api, updatePayload));
  });

  it('should allow SR for /activities/{type}/events', () => {
    const activityTypes = ['ClickEvent', 'BounceEvent', 'OpenEvent', 'UnsubEvent'];
    let id;
    return Promise.all(activityTypes.map(type => {
      return cloud.get(`${test.api}/${type}/events`)
        .then(r => {
          expect(r.body.length).to.be.at.least(1);
          id = r.body[0].ID;
        })
        .then(r => cloud.get(`${test.api}/${type}/events/${id}`));
    }));
  });

  test
    .withValidation(r => expect(r).to.have.statusCode(400))
    .withName(`should throw an error if a bad activity type is provided`)
    .withApi(`${test.api}/nope/events`)
    .should.return200OnGet();

  test.withApi(`${test.api}/ClickEvent/events`).should.supportNextPagePagination(2);

  test
    .withApi(`${test.api}/ClickEvent/events`)
    .withName(`should support CreatedDate query for ClickEvents`)
    .withOptions({ qs: { where: `CreatedDate > '2017-11-07T10:56:05'` } })
    .withValidation(r => expect(r.body.filter(obj => obj.CreatedDate > '2017-11-07T10:56:05')).to.not.be.empty)
    .should.return200OnGet();
});
