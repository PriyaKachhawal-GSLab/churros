'use strict';
const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('helpdesk', 'issuesecurity-schemes', (test) => {
  it('should allow SR for issuesecurity-schemes', () => {
    let issuesecurityschemes;
    return cloud.get('/hubs/helpdesk/issuesecurity-schemes')
      .then(r => issuesecurityschemes = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${issuesecurityschemes}`));
  });
  test.should.supportPagination();
});
