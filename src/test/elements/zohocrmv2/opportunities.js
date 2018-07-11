'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const chakram = require('chakram');
const expect = chakram.expect;
const opportunitiesPayload = require('./assets/opportunities');
const notesPayload = require('./assets/notes');

suite.forElement('crm', 'opportunities', { payload: opportunitiesPayload }, (test) => {
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

    it('should allow CRUDS for opportunities/{id}/notes', () => {
      let opportunityId = -1;
      return cloud.post(test.api, opportunitiesPayload)
        .then(r => opportunityId = r.body.id)
        .then(r => cloud.cruds(`${test.api}/${opportunityId}/notes`, notesPayload, chakram.put))
        .then(r => cloud.post(`${test.api}/${opportunityId}/notes`, notesPayload))
        .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${opportunityId}/notes`))
        .then(r => expect(r.body.length).to.equal(1))
        .then(r => cloud.delete(`${test.api}/${opportunityId}`));
    });
});
