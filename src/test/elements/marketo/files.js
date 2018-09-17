'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('marketing', 'files', (test) => {
  it('should allow creating a file for an uploaded file, and should get the created file', () => {
    let fileId;
    let path = __dirname + '/assets/brady_original.jpg';
    return cloud.postFile(test.api, path)
      .then(r => fileId = r.body.id)
      .then(r => cloud.get(`${test.api}`))
      .then(r => cloud.patchFile(`${test.api}/${fileId}/content`, path))
      .then(r => cloud.get(`${test.api}/${fileId}`));
  });
});
