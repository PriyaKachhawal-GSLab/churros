'use strict';

const suite = require('core/suite');
const customers = require('./assets/customers');

suite.forElement('finance', 'polling', null, (test) => {
  test.withApi('/hubs/finance/customers').should.supportPolling(customers, 'customers');
});
