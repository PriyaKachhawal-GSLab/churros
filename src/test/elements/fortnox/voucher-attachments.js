'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
let payload = tools.requirePayload(`${__dirname}/assets/voucher-attachments.json`);
const voucherPayload = tools.requirePayload(`${__dirname}/assets/voucher.json`);

suite.forElement('erp', 'voucher-attachments', { payload: payload }, (test) => {
  let textFile = __dirname + '/assets/test.txt';
  let opts = { qs: { folderId: 'inbox' } };
  let fileId, voucherNumber, VoucherSeries;
  before(() => cloud.withOptions(opts).postFile('/hubs/erp/files', textFile)
    .then(r => fileId = r.body.Id)
    .then(r => cloud.post('/hubs/erp/vouchers', voucherPayload))
    .then(r => {
      payload.FileId = fileId;
      payload.VoucherNumber = r.body.id;
      payload.VoucherSeries = r.body.VoucherSeries;
    }));

  it(`should allow CRDS operations and pagination for voucher-attachments`, () => {
    return cloud.get(test.api)
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(test.api))
      .then(r => expect(r.body.length).to.be.below(2))
      .then(r => cloud.withOptions({ qs: { page: 2, pageSize: 2 } }).get(test.api))
      .then(r => expect(r.body.length).to.be.below(3))
      .then(r => cloud.post(test.api, payload))
      .then(r => fileId = r.body.FileId)
      .then(r => cloud.get(`${test.api}/${fileId}`))
      .then(r => cloud.delete(`${test.api}/${fileId}`));
  });
});
