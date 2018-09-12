'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const queryPayload = tools.requirePayload(`${__dirname}/assets/visits-queryTest.json`);

suite.forElement('marketing', 'visits', {}, (test) => {
  let visitorId, visitId;

  it(`should allow SR for ${test.api}`, () => {
    return cloud.get('/visitors')
    .then(r => visitorId = r.body[0].id )
    .then(r => queryPayload.where = `visitior_ids = ${visitorId} `)
    .then(() => cloud.withOptions({qs:queryPayload}).get(test.api))
    .then(r => visitId = r.body[0].id)
    .then(() => cloud.withOptions().get(`${test.api}/${visitId}`));
  });
  test.withOptions({qs:{where:`visitor_ids='${visitorId}'`}}).should.supportPagination();
});
