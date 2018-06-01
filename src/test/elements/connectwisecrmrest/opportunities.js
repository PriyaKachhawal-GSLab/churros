'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const payload = require('./assets/opportunities');

suite.forElement('crm', 'opportunities', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.should.supportPagination();
  test.should.supportCeqlSearch('id');
});
