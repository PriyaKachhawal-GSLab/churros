'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
//const tools = require('core/tools');

suite.forElement('finance', 'ping', (test) => {
    it(`should support S for ${test.api}`, () => {
      // let id;
      return cloud.get(`${test.api}`);
    
        // .then(r => cloud.get(`${test.api}`))
        // .then(r => id = r.body[6].key.id)
        // var Id = encodeURI(id)
        // .then(r => cloud.get(`${test.api}/${ID}`));
    });
  });
