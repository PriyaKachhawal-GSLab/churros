'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/folders.json`);
const expect = require('chakram').expect;
const cloud = require('core/cloud');

suite.forElement('crm', 'folders', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination();
  it(`should support S, with IN operator for /hubs/crm/folders`, () => {
    let internalIds = [];
    return cloud.withOptions({ qs: {page: 1, pageSize: 5} }).get(`/hubs/crm/folders`)
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
