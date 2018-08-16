'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/placement-change-requests.json`);


suite.forElement('crm', 'placement-change-requests', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.should.supportPagination();
  test.withOptions({ qs: { where: 'status=\'Interview Scheduled\'' } })
    .withName('should support search by filter')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.status = 'Interview Scheduled');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
  it('should support search by fields for placement-change-requests', () => {
    let placementRequestId;
    return cloud.get(`${test.api}`)
      .then(r => placementRequestId = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${placementRequestId}`))
      .then(r => cloud.withOptions({ qs: { fields: 'status,dateAdded' } }).get(`${test.api}/${placementRequestId}`)
        .then(r => {
          expect(r.body).to.contain.key('status');
          expect(r.body).to.contain.key('dateAdded');
        }));
  });

});
