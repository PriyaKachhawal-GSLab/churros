'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const voucherPayload = tools.requirePayload(`${__dirname}/assets/voucher.json`);
let payload = {};

suite.forElement('erp', 'voucher-attachments', { payload: payload }, (test) => {
  let textFile = __dirname + '/assets/test.txt';
  let opts = { qs: { folderId: 'inbox' } };
  let fileId;
  before(() => cloud.withOptions(opts).postFile('/hubs/erp/files', textFile)
    .then(r => fileId = r.body.Id)
    .then(r => cloud.post('/hubs/erp/vouchers', voucherPayload))
    .then(r => {
      payload.FileId = fileId;
      payload.VoucherNumber = r.body.id;
      payload.VoucherSeries = r.body.VoucherSeries;
    }));

  test.should.supportPagination();

  it(`should allow CRDS operations and pagination for voucher-attachments`, () => {
    return cloud.get(test.api)
      .then(r => cloud.post(test.api, payload))
      .then(r => fileId = r.body.FileId)
      .then(r => cloud.get(`${test.api}/${fileId}`))
      .then(r => cloud.delete(`${test.api}/${fileId}`));
  });
});
