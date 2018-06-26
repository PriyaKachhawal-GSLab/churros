'use strict';

const suite = require('core/suite');
const payload = require('core/tools').requirePayload(`${__dirname}/assets/accounts.json`);
const expect = require('chakram').expect;
const cloud = require('core/cloud');

// Sample Custom Where Clause for Reference
//`custom.long.scriptId` = 'custentity_cust_priority' and `custom.long.value` = 50
//`custom.multi.scriptId` = 'custentity1' and `custom.multi.value.internalId` = 1
//`custom.boolean.scriptId` = 'custentity_2663_direct_debit' and `custom.boolean.value` = 'false'

suite.forElement('crm', 'accounts', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination();
  test.withOptions({ qs: { page: 1,
                          pageSize: 5,
                         where : "`custom.multi.scriptId` = 'custentity1' and `custom.multi.value.internalId` = 1"
                         } }).should.return200OnGet();
  it(`should support S,  with IN operator for /hubs/crm/accounts`, () => {
    let internalIds = [];
    return cloud.withOptions({ qs: {page: 1, pageSize: 5} }).get(`/hubs/crm/accounts`)
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
