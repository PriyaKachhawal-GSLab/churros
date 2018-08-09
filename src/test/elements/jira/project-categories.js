'use strict';
const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('helpdesk', 'project-categories', (test) => {
  it('should allow SR for project-categories', () => {
    let projectcategories;
    return cloud.get(test.api)
      .then(r => projectcategories = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${projectcategories}`));
  });
  test.should.supportPagination();
});
