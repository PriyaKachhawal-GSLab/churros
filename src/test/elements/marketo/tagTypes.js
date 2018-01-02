'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('marketing', 'tagTypes', { skip: false }, (test) => {
  let tagType;
  test.should.supportPagination();
  it('should allow Sr for Tagtypes ', () => {
    return cloud.get(test.api)
      .then(r => tagType = r.body[0].tagType)
      .then(r => cloud.get(`${test.api}/${tagType}`));
  });
});
