'use strict';

const suite = require('core/suite');

suite.forElement('erp', 'folders', (test) => {
  let rootFolderId = 'root';
  test.withApi(`${test.api}/contents`)
    .withOptions({ qs: { path: 'inbox' } })
    .withName('should allow GET folders/contents with path')
    .should.return200OnGet();

  test.withApi(`${test.api}/${rootFolderId}/contents`)
    .withName('should allow GET folders/{id}/contents with folder Id')
    .should.return200OnGet();
});
