'use strict';

const suite = require('core/suite');
const chakram = require('chakram');
const expect = chakram.expect;
const cloud = require('core/cloud');

suite.forElement('crm', 'activities', (test) => {
  it('should allow RS for /activities', () => {
    let activityId;
    return cloud.get(`${test.api}`)
      .then(r => {
        activityId = r.body[0].id;
      })
      .then(r => cloud.get(`${test.api}/${activityId}`));
  });

});
