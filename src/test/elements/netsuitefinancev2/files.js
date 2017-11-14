'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/folders.json`);

suite.forElement('finance', 'files', (test) => {
  let folderId;
  before(() => cloud.post(`/folders`, payload)
    .then(r => folderId = r.body.id));

  it('should support CRD for /hubs/finance/files', () => {
    let path = __dirname + `/assets/test.txt`;
    let fileId;
    return cloud.withOptions({ qs: { folderId: folderId } }).postFile(test.api, path)
      .then(r => fileId = r.body.id)
      .then(r => cloud.get(`${test.api}/${fileId}`))
      .then(r => cloud.delete(`${test.api}/${fileId}`));
  });


  it('should support UD /:objectName/:id/file/:id to a invoice', () => {
    let invoiceId, fileId;
    return cloud.get('/invoices')
      .then(r => invoiceId = r.body[0].id)
      .then(r => cloud.withOptions({ qs: { folderId: folderId } }).postFile('/files', `${__dirname}/assets/test.txt`))
      .then(r => fileId = r.body.id)
      .then(r => cloud.put(`/invoices/${invoiceId}/files/${fileId}`))
      .then(r => cloud.delete(`/invoices/${invoiceId}/files/${fileId}`))
      .then(r => cloud.delete(`/files/${fileId}`)) ;
     });
  after(() => cloud.delete(`/folders/${folderId}`));
});
