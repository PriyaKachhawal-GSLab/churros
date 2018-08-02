'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const chakram = require('chakram');
const expect = chakram.expect;
const leadsPayload = require('./assets/leads');
const notesPayload = require('./assets/notes');

suite.forElement('crm', 'leads', { payload: leadsPayload }, (test) => {
  test.should.supportCruds(chakram.put);
  test.should.supportPagination();
  test.withName(`should support searching ${test.api} by word`)
    .withOptions({ qs: { where: 'word=\'max\'' } })
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => JSON.stringify(obj).toLowerCase().indexOf('max'));
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();

  it('should allow CRUDS for leads/{id}/notes', () => {
    let leadId = -1;
    return cloud.post(test.api, leadsPayload)
      .then(r => leadId = r.body.id)
      .then(r => cloud.cruds(`${test.api}/${leadId}/notes`, notesPayload, chakram.put))
      .then(r => cloud.post(`${test.api}/${leadId}/notes`, notesPayload))
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${leadId}/notes`))
      .then(r => expect(r.body.length).to.equal(1))
      .then(r => cloud.delete(`${test.api}/${leadId}`));
  });
});
