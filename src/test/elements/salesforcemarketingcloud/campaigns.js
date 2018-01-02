'use strict';

const suite = require('core/suite');
const payload = require('./assets/campaigns');

suite.forElement('marketing', 'campaigns', { payload: payload }, (test) => {
  test.should.supportCrds();
  test.should.supportPagination('id');
});
