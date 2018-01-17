'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const payload = require('./assets/files');
const tools = require('core/tools');

suite.forElement('documents', 'files', { payload: payload }, (test) => {
  let txtFileBody, txtFile = __dirname + '/assets/textFile.txt';
  let query = { path: `/123/churros/textFile-${tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 10)}.txt` };

  before(() => cloud.withOptions({ qs: query }).postFile(test.api, txtFile)
    .then(r => txtFileBody = r.body));


  it('should allow ping for onenote', () => {
    return cloud.get(`/hubs/documents/ping`);
  });

  it('should allow CRD for hubs/documents/files and RU for hubs/documents/files/metadata by path', () => {
    let UploadFile = __dirname + '/assets/textFile.txt',
      folderId;
      //Hardcoding the fileName here as we do not get path in the response for futher test cases
    return cloud.withOptions({ qs: { path: `/123/churros/textFileChurros.txt`, overwrite: 'true' } }).postFile(`${test.api}`, UploadFile)
      .then(r => cloud.withOptions({ qs: { path: `/123/churros/textFileChurros.txt` } }).get(`${test.api}`))
      .then(r => cloud.withOptions({ qs: { path: `/123/churros/textFileChurros.txt`, overwrite: true } }).post(`${test.api}/copy`, payload))
      .then(r => folderId = r.body.id)
      .then(r => cloud.withOptions({ qs: { path: `/123/churros/textFileChurros.txt` } }).get(`${test.api}/links`))
      .then(r => cloud.withOptions({ qs: { path: `/123/churros/textFileChurros.txt` } }).get(`${test.api}/metadata`))
      .then(r => cloud.delete(`${test.api}/${folderId}`));
  });
});
