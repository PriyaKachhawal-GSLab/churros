'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('marketing', 'partitions', (test) => {
  it('should allow R for /partitions', () => {
    return cloud.get(test.api);
  });
});


