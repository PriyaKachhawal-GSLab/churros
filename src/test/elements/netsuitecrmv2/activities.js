'use strict';

const suite = require('core/suite');
const payload = require('./assets/activities');
const expect = require('chakram').expect;
const cloud = require('core/cloud');

suite.forElement('crm', 'activities', { payload: payload}, (test) => {
  test.should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.return200OnGet();
  it(`should support S, with IN operator for /hubs/crm/activities`, () => {
    let internalIds = [];
    return cloud.withOptions({ qs: {page: 1, pageSize: 5} }).get(`/hubs/crm/activities`)
    .then(r => r.body.forEach(function (entry) {
    if (entry.id)
      internalIds.push(entry.id);
    }))
    .then(r => cloud.withOptions({ qs: { where: `internalId in (${internalIds})`} }).get((test.api), (r) => {
    expect(r.body.length).to.equal(5);
    expect(r).to.have.statusCode(200);
    }));
  });
  test.should.supportCeqlSearch('id');
});
