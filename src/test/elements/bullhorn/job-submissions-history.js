'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;
const cloud = require('core/cloud');

suite.forElement('crm', 'job-submissions-history', (test) => {
  test.should.supportSr();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination();
  test.withOptions({ qs: { where: 'status=\'Interview Scheduled\'' } })
      .withName('should support search by filter')
      .withValidation(r => {
        expect(r).to.statusCode(200);
        const validValues = r.body.filter(obj => obj.status = 'Interview Scheduled');
        expect(validValues.length).to.equal(r.body.length);
      })
  .should.return200OnGet();
   it('should support search by fields for job-submissions-history', () => {
  let jobSubmissionshistoryId;
   return cloud.get(`${test.api}`)
  .then(r => jobSubmissionshistoryId = r.body[0].id)
  .then(r => cloud.get(`${test.api}/${jobSubmissionshistoryId}`))
  .then(r => cloud.withOptions({ qs: { fields: 'status,dateAdded' } }).get(`${test.api}/${jobSubmissionshistoryId}`)
  .then(r => {
    expect(r.body).to.contain.key('status');
    expect(r.body).to.contain.key('dateAdded');
  }))
});
});
