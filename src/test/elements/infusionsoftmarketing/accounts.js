'use strict';

const tester = require('core/tester');
const schema = require('./assets/accounts.schema');

tester.for('marketing', 'accounts', (api) => {
  // checkout functions available under tester.test which provide a lot of pre-canned tests
  //   more information here: https://github.com/cloud-elements/churros/blob/master/CONTRIBUTING.md#adding-tests-to-an-existing-suite

  it('jjwyse should insert some tests here :)', () => true);
});
