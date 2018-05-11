'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('general', 'repositories', (test) => {
  let id;
  it(`should allow RS operations for Repositories`, () => {
    return cloud.get(`${test.api}`)
      .then(r => id = r.body[0].owner.login)
      .then(r => cloud.get(`${test.api}/${id}`));
  });
  test.should.supportPagination();
});
