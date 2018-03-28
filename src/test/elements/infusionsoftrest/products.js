'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const chakram = require('chakram');
const expect = require('chakram').expect;

suite.forElement('crm', 'products', (test) => {
  test.should.supportSr();
  test.should.supportPagination();
});