'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const cloud = require('core/cloud');
const jobSubmissionsPayload = require('./assets/job-submissions');

const updatePayload = {
  "comments": "Comment on updated job-submissions"
};

suite.forElement('crm', 'job-submissions', { payload: jobSubmissionsPayload }, (test) => {
  const build = (overrides) => Object.assign({}, jobSubmissionsPayload, overrides);
  const payload = build({ comments: tools.random() });
  it('should create a job-submissions and then update', () => {
    let jobSubmissionsId;
    return cloud.post(test.api, payload)
      .then(r => jobSubmissionsId = r.body.changedEntityId)
      .then(r => cloud.get(`${test.api}/${jobSubmissionsId}`))
      .then(r => cloud.withOptions({ qs: { fields: 'comments,status' } })
        .get(`${test.api}/${jobSubmissionsId}`)
        .then(r => {
          expect(r.body).to.contain.key('comments');
          expect(r.body).to.contain.key('status');
        }))
      .then(r => cloud.patch(`${test.api}/${jobSubmissionsId}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${jobSubmissionsId}`));
  });
});
