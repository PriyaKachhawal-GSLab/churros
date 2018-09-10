'use strict';

const suite = require('core/suite');

suite.forElement('marketing', 'bulk', (test) => {
  const opts = { csv: true };
  test.should.supportBulkDownload({ qs: { q: 'select * from contacts where email = \'thisguy@churros.com\'' } }, opts, 'contacts');
});
