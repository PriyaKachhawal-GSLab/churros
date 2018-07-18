'use strict';

const suite = require('core/suite');
const payload = require('./assets/images');
const cloud = require('core/cloud');

suite.forElement('general', 'images', { payload: payload }, (test) => {
  test.should.supportCrds();
  test.should.supportPagination();

  it(`should allow GET for ${test.api}/{imageId}/background/{size} and ${test.api}/{imageId}/image/{size}`, () => {
    let imageId;
    let size = 'mobile';
    return cloud.post(`${test.api}`, payload)
      .then(r => imageId = r.body.id)
      .then(r => cloud.get(`${test.api}/${imageId}/background/${size}`))
      .then(r => cloud.get(`${test.api}/${imageId}/image/${size}`));
  });
});
