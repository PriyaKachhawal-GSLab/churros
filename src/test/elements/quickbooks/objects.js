'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('finance', 'objects', null, (test) => {
  it('should support GET /objects', () => {
    return cloud.get(test.api);
  });

  it('should support GET /objects/:objectName/metadata for all objects', () => {
    return cloud.get(test.api)
    .then(r => Promise.all(r.body.map(obj => cloud.get(`${test.api}/${obj}/metadata`))));
  });
});
