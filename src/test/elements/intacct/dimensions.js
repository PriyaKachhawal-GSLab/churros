'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

suite.forElement('finance', 'dimensions', (test) => {
  let originalDimension, restrictionDimension, options;

  before(() => cloud.get('/hubs/finance/dimensions-relationships')
    .then(r => {
      originalDimension = r.body[0].dimension;
      restrictionDimension = r.body[1].dimension;
      options = { qs: { dimension: restrictionDimension } };
    }));

  it(`should allow GET for ${test.api}/{id}/restrictions-data`, () => {
    return cloud.withOptions(options)
      .get(`${test.api}/${originalDimension}/restrictions-data`)
      .then(r => expect(r).to.statusCode(200));
  });
});
