'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

//Need to skip as there is no delete API
suite.forElement('esignature', 'transient-documents', {skip: true}, (test) => {
  it(`should allow POST for /transient-documents`, () => {
    return cloud.postFile(test.api, `${__dirname}/assets/attach.txt`);
  });
});
