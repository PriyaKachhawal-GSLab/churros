'use strict';

const suite = require('core/suite');

suite.forElement('marketing', 'contacts', null, (test) => {
  test.withOptions({ qs: { where: 'query=\'danielle@cloud-elements.com\'' } }).should.return200OnGet();
});
