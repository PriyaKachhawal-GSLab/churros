'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('marketing', 'visitors', {}, (test) => {
  test.should.supportS();
  test.should.supportPagination();
  it(`should allow SR for ${test.api}/:id/visits`, () => {
    let visitorId, visitId;
    return cloud.get(test.api)
    .then(r => visitorId = r.body[0].id)
    .then(() => cloud.get(`${test.api}/${visitorId}/visits`))
    .then(r => visitId = r.body[0].id)
    .then(() => cloud.get(`${test.api}/${visitorId}/visits/${visitId}`));
  });
});
