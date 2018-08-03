'use strict';
const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

suite.forElement('helpdesk', 'notification-schemes', (test) => {
  it('should allow SR for notification-schemes', () => {
    let notificationschemesname;
    return cloud.get('/hubs/helpdesk/notification-schemes')
      .then(r => notificationschemesname = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${notificationschemesname}`));
  });
  test.should.supportPagination();
  test.withOptions({ qs: { where :`expand='all'` }}).should.return200OnGet();
});
