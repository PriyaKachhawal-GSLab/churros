'use strict';

const suite = require('core/suite');

suite.forElement('helpdesk', 'worklogs', (test) => {
 
test.withOptions({ qs: { where: `updated='true'` }}).should.supportS();
test.withOptions({ qs: { where: `deleted='true'` }}).should.supportS();
test.withOptions({ qs: { where: `id in (10300)` }}).should.supportS();

test.withOptions({ qs: { where: `updated='true'` }}).should.supportPagination();

});
