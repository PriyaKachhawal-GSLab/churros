'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');

suite.forElement('documents', 'search', null, (test) => {

  it('should allow GET /hubs/documents/search ', () => {
    let UploadFile = __dirname + '/assets/Penguins.jpg',
      srcPath;
    return cloud.withOptions({ qs: { path: `/${tools.random()}`, overwrite: 'true', size: '777835' } }).postFile('/hubs/documents/files', UploadFile)
      .then(r => srcPath = r.body.path)
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}` } }).get(test.api))
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}`, page: 1, pageSize: 1 } }).get(test.api))
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}` } }).delete('/hubs/documents/files'));
  });
});
