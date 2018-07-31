'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('rewards', 'sent-gifts', null, (test) => {
  let trackingCode;

  test.should.supportPagination();

  it(`should allow S for ${test.api}`, () => {
    return cloud.get(test.api)
      .then(r => trackingCode = r.body.tracking_code)
      .then(r => cloud.get(`${test.api}/${trackingCode}/status`));
  });

  it(`should allow S for ${test.api}/{trackingCode}/status`, () => {
    return cloud.get(`${test.api}/${trackingCode}/status`);
  });
});
