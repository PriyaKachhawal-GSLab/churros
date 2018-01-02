'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const slocPayload = require('./assets/stransactionsPayload');
const tools = require('core/tools');
const transactionPayload = tools.requirePayload(`${__dirname}/assets/transactions.json`);
const transactionPayloadCapture = tools.requirePayload(`${__dirname}/assets/transactionsCapture.json`);


suite.forElement('employee', 'locations', (test) => {
  test.should.supportPagination();
  it(`should allow CRDS for /locations/:id/transactions`, () => {
    let transactionId, locId = slocPayload.lid;
    return cloud.withOptions({ qs: { where: "begin_time='2017-10-03T18:18:45Z'" } }).get(`${test.api}/${locId}/transactions`)
    .then(() => cloud.post(`${test.api}/${locId}/transactions`,transactionPayload))
    .then(r => transactionId = r.body.transaction.id)
    .then(() => cloud.get(`${test.api}/${locId}/transactions/${transactionId}`))
    .then(() => cloud.delete(`${test.api}/${locId}/transactions/${transactionId}`))
    .then(() => cloud.post(`${test.api}/${locId}/transactions`,transactionPayloadCapture))
    .then(r => transactionId = r.body.transaction.id)
    .then(() => cloud.post(`${test.api}/${locId}/transactions/${transactionId}/captures`));
  });
});
