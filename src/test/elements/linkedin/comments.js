'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/shares.json`);
const comment = tools.requirePayload(`${__dirname}/assets/comments.json`);

//Need to skip as there is no delete API
suite.forElement('social', 'comments', { skip: true }, (test) => {
  let companyId, updateId;

  it(`should allow CR for /hubs/social/companies/{id}/updates`, () => {
    return cloud.get('/hubs/social/companies')
      .then(r => companyId = r.body[0].id)
      .then(r => cloud.post(`/hubs/social/companies/${companyId}/updates`, payload))
      .then(r => updateId = r.body.updateKey)
      .then(r => cloud.get(`/hubs/social/companies/${companyId}/updates/${updateId}`))
      .then(r => cloud.withOptions({ qs: { 'event-type': 'status-update' } }).get(`/hubs/social/companies/${companyId}/updates`));
  });

  it('should allow paginating with page and pageSize for /hubs/social/companies/{id}/updates', () => {
    return cloud.withOptions({ qs: { page: 1, pageSize: 3 } }).get(`/hubs/social/companies/${companyId}/updates`)
      .then(r => expect(r.body.length).to.be.below(4))
      .then(r => cloud.withOptions({ qs: { page: 2, pageSize: 2 } }).get(`/hubs/social/companies/${companyId}/updates`))
      .then(r => expect(r.body.length).to.be.below(3));
  });

  it(`should allow CR for /hubs/social/companies/{id}/updates/comments`, () => {
    return cloud.post(`/hubs/social/companies/${companyId}/updates/${updateId}/comments`, comment)
      .then(r => cloud.withOptions({ qs: { updateKey: `${updateId}` } }).get(`/hubs/social/companies/${companyId}/updates/comments`));
  });

  it('should allow paginating with page and pageSize for /hubs/social/companies/{id}/updates/comments', () => {
    return cloud.withOptions({ qs: { page: 1, pageSize: 3, updateKey: `${updateId}` } }).get(`/hubs/social/companies/${companyId}/updates/comments`)
      .then(r => expect(r.body.length).to.be.below(4))
      .then(r => cloud.withOptions({ qs: { page: 2, pageSize: 2, updateKey: `${updateId}` } }).get(`/hubs/social/companies/${companyId}/updates/comments`))
      .then(r => expect(r.body.length).to.be.below(3));
  });

  it(`should allow GET ${test.api}/{id}/updates/likes`, () => {
    return cloud.withOptions({ qs: { updateKey: `${updateId}` } }).get(`/hubs/social/companies/${companyId}/updates/likes`);
  });

  it(`should allow paginating with page and pageSize for ${test.api}/{id}/likes`, () => {
    return cloud.withOptions({ qs: { updateKey: `${updateId}` } }).get(`/hubs/social/companies//${companyId}/updates/likes`)
      .then(r => expect(r.body.length).to.be.below(4))
      .then(r => cloud.withOptions({ qs: { updateKey: `${updateId}` } }).get(`/hubs/social/companies/${companyId}/updates/likes`))
      .then(r => expect(r.body.length).to.be.below(3));
  });
});
