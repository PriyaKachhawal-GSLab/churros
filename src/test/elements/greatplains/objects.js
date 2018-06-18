'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');

suite.forElement('finance', 'objects', (test) => {
    it(`should support S for ${test.api}`, () => {
      let id;
      return cloud.get(`${test.api}`)
    
        //  .then(r => cloud.get(`${test.api}`))
        // .then(r => id = r.body[0].taxDetailKey.id)
        // var Id = encodeURI(id)
        // .then(r => cloud.get(`${test.api}/${ID}`));
    });
  });
