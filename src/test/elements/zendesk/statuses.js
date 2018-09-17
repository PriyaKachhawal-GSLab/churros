'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/statuses-update.json`);
const cloud = require('core/cloud');

suite.forElement('helpdesk', 'statuses', (test) => {
  let ceqlQuery;
  it('should allow GET and PATCH for /statuses', () => {
    let statusId;
    ceqlQuery = 'lastModifiedDate>="Jan 15, 2014"';
    return cloud.get(test.api)
      .then(r => statusId = r.body[0].id)
      .then(r => cloud.withOptions({ qs: { includeDeleted: true } }).get(test.api))
      .then(r => cloud.get(`${test.api}/${statusId}`))
      .then(r => cloud.patch(`${test.api}/${statusId}`, payload));
  });
  test.withOptions({ qs: { where: ceqlQuery } }).should.return200OnGet();
  test.withOptions({ qs: { page: 1, pageSize: 1 } }).should.return200OnGet();

});
