'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('erp', 'files', (test) => {
  let fileId;
  it(`should allow POST and DELETE for /files`, () => {
    let textFile = __dirname + '/assets/test.txt';
    let opts = { qs: { folderId: 'inbox' } };
    return cloud.withOptions(opts).postFile(test.api, textFile)
      .then(r => fileId = r.body.Id);
  });
  after(() => test.withApi(`/hubs/erp/files/${fileId}`).should.return404OnDelete());
});
