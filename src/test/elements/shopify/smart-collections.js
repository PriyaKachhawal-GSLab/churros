'use strict';

const suite = require('core/suite');
const payload = require('./assets/smart-collections-create.json');
const updatePayload = require('./assets/smart-collections-update.json');

suite.forElement('ecommerce', 'smart-collections', { payload: payload }, (test) => {

  const options = {
    churros: {
      updatePayload: updatePayload
    }
  };
  test.withOptions(options).should.supportCruds();
});
