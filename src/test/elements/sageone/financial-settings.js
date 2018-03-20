'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;
const cloud = require('core/cloud');
const updatePayload =  require('./assets/financial-settings');

suite.forElement('finance', 'financial-settings', { payload: updatePayload }, (test) => {
    it(`should support search and update on ${test.api}`, () => {
      return cloud.get(`${test.api}`)
        .then(r => cloud.put(`${test.api}`, updatePayload));
    });
});
