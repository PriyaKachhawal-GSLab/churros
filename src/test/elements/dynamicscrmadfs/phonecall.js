'use strict';

const suite = require('core/suite');
const payload = require('./assets/phonecall');
const tools = require('core/tools');
const build = (overrides) => Object.assign({}, payload, overrides);
const phonecallPayload = build({ name: tools.random() });
const chakram = require('chakram');
const cloud = require('core/cloud');
const expect = chakram.expect;


suite.forElement('crm', 'phonecall', { payload: phonecallPayload }, (test) => {
  var phonecallUpdate = {
    attributes : {
      "description": "Sample Phone Call Activity Churros Updated"
    }
  };
  it('Update Test for /hubs/crm/phonecall', () => {
      var activityId = null;
      return cloud.post(test.api, phonecallPayload)
        .then(r => activityId = r.body.id)
        .then(() => cloud.patch(`${test.api}/${activityId}`, phonecallUpdate,(r) => {
          expect(r.body.attributes.description).to.equal("Sample Phone Call Activity Churros Updated");
          })
        )
        .then(r => cloud.delete(`${test.api}/${activityId}`));
      });
  test.should.supportCruds();
  test.should.supportPagination();
  test.should.supportCeqlSearch('id');
});
