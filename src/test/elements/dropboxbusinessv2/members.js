'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const props = require('core/props');
const payload = require('./assets/members');


suite.forElement('documents', 'members', { payload: payload,skip:true }, (test) => {
  let memberId = props.getForKey('dropboxbusinessv2', 'username');

  const email = 'devteammember@cloud-elements.com';
  const external_id = 'company_id:342432';

  test.should.return200OnGet();

  // member is unsuspended twice to make sure it's in a state where it can be tested next time.
  it('should support PATCH for ${test.api}/members/{id}/suspend/{wipe_data}', () => {
    return cloud.patch(`${test.api}/${memberId}/suspend/false`);
  });

  it('should allow PATCH for ${test.api}/members/{id}/unsuspend', () => {
    return cloud.patch(`${test.api}/${memberId}/unsuspend`);
  });

  it('should support PATCH for ${test.api}/members/{id}/suspend/{wipe_data}', () => {
    return cloud.patch(`${test.api}/${memberId}/suspend/true`);
  });

  it('should allow PATCH for ${test.api}/members/{id}/unsuspend', () => {
    return cloud.patch(`${test.api}/${memberId}/unsuspend`);
  });

  test.withOptions({ qs: { where: `team_member_id = \'${memberId}\'` } }).withApi(`/hubs/documents/members`).should.return200OnGet();

  test.withOptions({ qs: { where: `email = \'${email}\'` } }).withApi(`/hubs/documents/members`).should.return200OnGet();

  test.withOptions({ qs: { where: `external_id = \'${external_id}\'` } }).withApi(`/hubs/documents/members`).should.return200OnGet();
});
