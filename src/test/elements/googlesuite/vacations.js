'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('general', 'vacations', null , (test) => {

  it('should test SU /vacations', () => {
  return cloud.get(test.api)
   .then(r => cloud.patch(test.api, null));
  });

});
