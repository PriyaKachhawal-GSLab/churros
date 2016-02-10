'use strict';

const tester = require('core/tester');
const schema = require('./assets/serviceContracts.schema');

tester.for('fsa', 'serviceContracts', (api) => {
  // checkout functions available under tester.it which provide a lot of pre-canned tests
  //   more information here: https://github.com/cloud-elements/churros/blob/master/CONTRIBUTING.md#adding-tests-to-an-existing-suite

  it('jjwyse should insert some tests here :)', () => true);
});
