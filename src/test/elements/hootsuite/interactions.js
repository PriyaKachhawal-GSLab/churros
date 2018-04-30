'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('social', 'interactions', (test) => {
  
  it(`should allow GET for ${test.api}`, () => {
    return cloud.withOptions({ qs: { where: "socialNetworkType='Twitter' and socialNetworkId=82295100 and targetSocialNetworkId=876713392311902208" } }).get(`${test.api}`)});
});
