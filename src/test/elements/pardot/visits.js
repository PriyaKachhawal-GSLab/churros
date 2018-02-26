'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('marketing', 'visits', {}, (test) => {
  let visitorId, visitId;
  
  it(`should allow SR for ${test.api}`, () => {
    return cloud.get('/visitors')
    .then(r => visitorId = r.body[0].id )
    .then(() => cloud.withOptions({qs:{where: `visitor_ids='${visitorId}'`}}).get(test.api))
    .then(r => visitId = r.body[0].id)
    .then(() => cloud.withOptions().get(`${test.api}/${visitId}`));
  });
  test.withOptions({qs:{where:`visitor_ids='${visitorId}'`}}).should.supportPagination();
});
