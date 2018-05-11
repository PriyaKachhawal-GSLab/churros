'use strict';

const suite = require('core/suite');
const build = (overrides) => Object.assign({}, payload, overrides);
const chakram = require('chakram');
const cloud = require('core/cloud');

suite.forElement('crm', 'contacts', { }, (test) => {
  test.withOptions({ qs: { where : `listid = '8cc802ca-6154-e811-812e-e0071b715b91'` } }).should.supportPagination();
});
