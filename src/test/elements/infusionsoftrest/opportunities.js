'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;
const cloud = require('core/cloud');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/opportunities.json`);

suite.forElement('crm', 'opportunities', {payload: payload, skip: true}, (test) => {
  test.should.supportCrus();
  test.should.supportPagination();
  test
    .withOptions({ qs: { where: 'user_id= 1' } })
    .withName('should support search by user_id')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.user.id = 1);
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();

  it('should support S for /opportunity/stage_pipeline', () => {
    return cloud.get(`/opportunity/stage_pipeline`);
  });
});