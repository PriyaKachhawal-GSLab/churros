'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('helpdesk', 'lists', null, (test) => {
  it('should allow SR for /lists', () => {
    let id;
    return cloud.get(test.api)
      .then(r => id = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => cloud.get(`${test.api}/${id}/search`));
  });
});
