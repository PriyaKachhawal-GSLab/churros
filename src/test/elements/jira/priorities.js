'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const uri = '/hubs/helpdesk/priorities';

suite.forElement('helpdesk', 'priorities', (test) => {
let priorityId;
  it('should allow CRUDS for /priorities', () => {
    return cloud.get(uri)
    .then(r => priorityId = r.body[0].id)
    .then(r => cloud.get(uri + '/' + priorityId))
    .then(r => cloud.withOptions({qs:{page: 1, pageSize: 1 }}).get(uri));
  });
});
