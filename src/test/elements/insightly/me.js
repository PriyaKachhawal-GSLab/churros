'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('crm', 'me', (test) => {
  it('should allow S for /me', () => {
    return cloud.get(`${test.api}`);
  });
});