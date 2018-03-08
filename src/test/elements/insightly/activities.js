'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const chakram = require('chakram');
const expect = chakram.expect;

suite.forElement('crm', 'activities', (test) => {
  test.should.supportSr();
  test.should.supportPagination();
});