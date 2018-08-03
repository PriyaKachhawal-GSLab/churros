'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const all = require('chakram').all;
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/access-control-list.json`);
const calendarsPayload = tools.requirePayload(`${__dirname}/assets/calendars.json`);

suite.forElement('scheduling', 'calendars', { payload }, (test) => {
  let calendarId;
  before(() => cloud.post(test.api, calendarsPayload)
    .then(r => calendarId = r.body.id));

  after(() => cloud.delete(`${test.api}/${calendarId}`));

  it(`should allow CRUDS for ${test.api}/:id/access-control-list`, () => {
    return cloud.cruds(`${test.api}/${calendarId}/access-control-list`, payload);
  });

  it(`should allow where for ${test.api}/:id/access-control-list`, () => {
    return cloud.withOptions({ qs: { where: `showDeleted='true'` } }).get(`${test.api}/${calendarId}/access-control-list`)
      .then(r => expect(r.body).to.not.be.empty);
  });

  it(`should allow paginating for ${test.api}/:id/access-control-list`, () => {
    const genPayload = () => payload;
    let aclIds = [];
    return all([0, 1, 2, 3].map(o => cloud.post(`${test.api}/${calendarId}/access-control-list`, genPayload())))
      .then(r => r.forEach(o => aclIds.push(o.body.id)))
      .then(r => cloud.supportPagination(`${test.api}/${calendarId}/access-control-list`, 'id'))
      .then(r => all(aclIds.map(id => cloud.delete(`${test.api}/${calendarId}/access-control-list/${id}`))));
  });
});