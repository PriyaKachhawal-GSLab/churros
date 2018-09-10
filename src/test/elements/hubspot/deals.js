'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/deals-create.json`);
//const searchTest = tools.requirePayload(`${__dirname}/assets/deals-searchTest.json`);
const cloud = require('core/cloud');
const moment = require('moment');

suite.forElement('marketing', 'deals', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.should.supportPagination();

  it('should test deals poller url', () => {
    let id;
    let objects;
   const options = { qs: { where: "lastmodifieddate='" + moment().subtract(5, 'seconds').format() + "'" } };
    const checkLength = (objects) => {
      return (objects.length > 0);
    };
    const checkId = (postedId, polledId) => {
      return (postedId === polledId);
    };
    return cloud.post(test.api, payload)
      .then(r => id = r.body.id )
      .then(r => tools.sleep(10))
      .then(r => cloud.withOptions(options).get(test.api))
      .then(r => objects = r.body)
      .then(r => checkLength(objects))
      .then(r => expect(r).to.be.true)
      .then(r => checkId(id, objects[0].id))
      .then(r => expect(r).to.be.true)
      .then(r => expect(objects[0].properties).to.contain.key('hs_lastmodifieddate') && expect(objects[0].properties).to.contain.key('createdate'))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
});
