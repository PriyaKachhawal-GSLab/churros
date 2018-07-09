'use strict';
const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

suite.forElement('helpdesk', 'groups', (test) => {
  it('should allow SR for groups', () => {
    let groupname;
    return cloud.get('/hubs/helpdesk/groups')
      .then(r => groupname = r.body[0].name)
      .then(r => cloud.get(`${test.api}/${groupname}`));
  });
  test.should.supportPagination();
  test.withOptions({ qs: { where: `query='admin'` } })
    .withName('should support search by filter')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => JSON.stringify(obj).toLowerCase().indexOf('admin'));
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
});
