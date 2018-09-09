'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');

const termsCreatePayload = tools.requirePayload(`${__dirname}/assets/terms-create.json`);
const termsUpdatePayload = tools.requirePayload(`${__dirname}/assets/terms-update.json`);

suite.forElement('finance', 'terms', { payload: termsCreatePayload }, (test) => {
  let termId = termsCreatePayload.name;
  termsUpdatePayload.name = termsCreatePayload.name;
  test.should.supportPagination();
  it('should allow CRUDS for /hubs/finance/terms', () => {
    return cloud.post(test.api, termsCreatePayload)
      .then(r => cloud.get(test.api))
      .then(r => cloud.get(`${test.api}/${termId}`))
      .then(r => cloud.patch(`${test.api}/${termId}`, termsUpdatePayload))
      .then(r => cloud.delete(`${test.api}/${termId}`));
  });
  test.withName('should support updated > {date} Ceql search').withOptions({ qs: { where: 'whenmodified>\'08/13/2016 05:26:37\'' } }).should.return200OnGet();
});
