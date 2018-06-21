'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
suite.forElement('finance', 'objects', (test) => {
    it(`should support S for ${test.api}`, () => {
      
      return cloud.get(`${test.api}`);
    
    });
  });
