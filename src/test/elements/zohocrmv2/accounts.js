'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const chakram = require('chakram');
const expect = chakram.expect;
const accountsPayload = require('./assets/accounts');
const notesPayload = require('./assets/notes');

suite.forElement('crm', 'accounts', { payload: accountsPayload }, (test) => {
  it('should allow ping for zohocrmv2', () => {
    return cloud.get(`/hubs/crm/ping`);
  });

  test.should.supportCruds(chakram.put);
  test.should.supportPagination();
  test.withName(`should support searching ${test.api} by word`)
    .withOptions({ qs: { where: 'word=\'Test\'' } })
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => JSON.stringify(obj).toLowerCase().indexOf('test'));
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();

  it('should allow CRUDS for accounts/{id}/notes', () => {
    let accountId = -1;
    return cloud.post(test.api, accountsPayload)
      .then(r => accountId = r.body.id)
      .then(r => cloud.cruds(`${test.api}/${accountId}/notes`, notesPayload, chakram.put))
      .then(r => cloud.post(`${test.api}/${accountId}/notes`, notesPayload))
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${accountId}/notes`))
      .then(r => expect(r.body.length).to.equal(1))
      .then(r => cloud.delete(`${test.api}/${accountId}`));
  });
});
