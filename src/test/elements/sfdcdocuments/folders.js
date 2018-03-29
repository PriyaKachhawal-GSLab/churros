'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('documents', 'folders', null, (test) => {
  it('should allow GET for hubs/documents/folders/contents  by path', () => {
    return cloud.withOptions({ qs: { path: `/` } }).get(`${test.api}/contents`);
  });
  
  test.withApi(`${test.api}/contents`).withOptions({qs: {path :'/'}}).should.supportNextPagePagination(1);
});
