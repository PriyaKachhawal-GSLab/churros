'use strict';
const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

suite.forElement('helpdesk', 'permission-schemes', (test) => {
  it('should allow SR for permission-schemes', () => {
    let permissionschemes;
    return cloud.get('/hubs/helpdesk/permission-schemes')
      .then(r => permissionschemes = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${permissionschemes}`));
  });
  test.should.supportPagination();
  test.withOptions({ qs: { where :`expand='all'` }}).should.return200OnGet();
});
