'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const payload = require('./assets/messages');

suite.forElement('messaging', 'messages', { payload: payload }, (test) => {
  it(`should allow C for ${test.api}`, () => {
    return cloud.post(test.api, payload)
      .then(r => expect(r.body.from).to.equal('churros@gmail.com'));
  });
});
