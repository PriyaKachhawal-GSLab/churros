'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload = require('./assets/folders');
const build = (overrides) => Object.assign({}, payload, overrides);
const foldersPayload = build({ path: `/${tools.random()}` });

suite.forElement('documents', 'search', (test) => {
  it(`should allow GET ${test.api}`, () => {
    let srcPath;
    return cloud.post('/hubs/documents/folders', foldersPayload)
      .then(r => srcPath = r.body.path)
      .then(r => cloud.withOptions({ qs: { path: srcPath } }).get(test.api));
  });
  test.should.supportNextPagePagination(1);
  test.should.supportPagination();
});
