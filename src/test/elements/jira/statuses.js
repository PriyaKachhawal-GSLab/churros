'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const uri = '/hubs/helpdesk/statuses';

suite.forElement('helpdesk', 'statuses', (test) => {
let statusId;
  it('should allow CRUDS for /statuses', () => {
    return cloud.get(uri)
    .then(r => statusId = r.body[0].id)
    .then(r => cloud.get(uri + '/' + statusId))
    .then(r => cloud.withOptions({qs:{page: 1, pageSize: 1 }}).get(uri));
  });
});
