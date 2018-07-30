'use strict';

const suite = require('core/suite');
const payload = require('./assets/themes');

suite.forElement('general', 'themes', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.should.supportPagination();
});
