'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('finance', 'subscriptions', (test) => {
  it(`should allow GET for ${test.api} and ${test.api}/{id}/preferences`, () => {
    let id;
    return cloud.get(test.api)
      .then(r => id = r.body[0])
      .then(r => cloud.get(`${test.api}/${id}/preferences`));
  });
  test.should.supportNextPagePagination(2);
});
