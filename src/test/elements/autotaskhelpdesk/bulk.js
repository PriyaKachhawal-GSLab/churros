'use strict';

const suite = require('core/suite');

suite.forElement('helpdesk', 'bulk', null, (test) => {
  const opts = {csv: true, json: true};
  test.withOptions({qs: { json: '{ "convertToNativeType": "false" }' }}).should.supportBulkDownload({ qs: { q: 'select * from contacts where firstName=\'Rick\'' } }, opts, 'contacts');
});
