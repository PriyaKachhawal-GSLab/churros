'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('payment', 'transactions', (test) => {
  test.should.return200OnGet();
  it(`should allow GET for ${test.api}/{transactionId}`, () => {
    let transactionId;
    return cloud.get(`${test.api}`)
      .then(r => transactionId = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${transactionId}`));
  });
});
