'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('erp', 'files', (test) => {
  it.skip(`should allow POST for /files`, () => {
    let textFile = __dirname + '/assets/test.txt';
    let opts = { qs: { folderId: 'inbox' } };
    return cloud.withOptions(opts).postFile(test.api, textFile);
  });
});
