'use strict';
const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('helpdesk', 'permission-schemes', (test) => {
  it('should allow SR for permission-schemes', () => {
    let permissionschemes;
    return cloud.get(test.api)
      .then(r => permissionschemes = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${permissionschemes}`));
  });
  test.should.supportPagination();
  test.withOptions({ qs: { where :`expand='all'` }}).should.return200OnGet();
});
