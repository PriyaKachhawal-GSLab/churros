'use strict';

const suite = require('core/suite');
const payload = require('./assets/members');

suite.forElement('documents', 'members', payload, (test) => {
  // checkout functions available under test.should which provide a lot of pre-canned tests
  //   more information here: https://github.com/cloud-elements/churros/blob/master/CONTRIBUTING.md#adding-tests-to-an-existing-suite

  it('natedoyle should insert some tests here :)', () => true);
});
