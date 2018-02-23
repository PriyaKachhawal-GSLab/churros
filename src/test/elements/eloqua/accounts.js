'use strict';

const suite = require('core/suite');
const payload = require('./assets/accounts');

suite.forElement('marketing', 'accounts', { payload: payload }, (test) => {
  const opts = {
    churros: {
      updatePayload: {
        name: 'Robot Test Update'
      }
    }
  };
  test.withOptions(opts).should.supportCruds();
});