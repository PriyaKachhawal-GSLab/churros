'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('finance', 'classes', null, (test) => {
  it('should support SR, pagination and Ceql search for /hubs/finance/classes', () => {
    let id;
    return cloud.get(test.api)
      .then(r => id = r.body[0].id)
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(test.api))
      .then(r => cloud.withOptions({ qs: { where: `Name='Automatic Pool Systems'` } }).get(test.api))
      .then(r => cloud.get(`${test.api}/${id}`));
  });
  test.should.supportNextPagePagination(1);
});
