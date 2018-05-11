'use strict';

const suite = require('core/suite');
const build = (overrides) => Object.assign({}, payload, overrides);
const chakram = require('chakram');
const cloud = require('core/cloud');

suite.forElement('crm', 'contacts', { }, (test) => {
  test.withOptions({ qs: { where : `listid = 'c6d384d2-5749-e811-8120-e0071b66cf61'` } }).should.supportPagination();
});
