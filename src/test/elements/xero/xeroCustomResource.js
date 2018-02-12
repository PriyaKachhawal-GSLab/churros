'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const random = require('faker').random;

let payload = tools.requirePayload(`${__dirname}/assets/contact.json`);
let attachmentMetadata = tools.requirePayload(`${__dirname}/assets/attachmentMetadata.json`);


suite.forElement('finance', 'xeroCustomResource', {payload}, (test) => {
  let myResourceId;
  before(() => cloud.post(test.api, payload)
    .then(r => myResourceId = r.body.id)
  );
  

  after(() => cloud.delete(`${test.api}/${myResourceId}`));

  afterEach(done => {
    // to avoid rate limit errors
    setTimeout(done, 5000);
  });

  it(`should support CRS for /:objectName/:objectId/attachments with transformations`, () => {
    let path = __dirname + '/assets/image.png';
    let fileName = random.word() + '.png';
    attachmentMetadata.FileName = fileName;
    const attachment = { 
      formData: { 
        metadata:  JSON.stringify(attachmentMetadata)
      } 
    };

    return cloud.withOptions(attachment).postFile(`${test.api}/${myResourceId}/xeroCustomChildResource`, path)
    .then(r => expect(r.body.FileName).to.equal(fileName))
    .then(() => cloud.get(`${test.api}/${myResourceId}/xeroCustomChildResource`))
    .then(r => expect(r.body[0].FileName).to.exist)
    .then(() => cloud.get(`${test.api}/${myResourceId}/xeroCustomChildResource/${fileName}`));
  });
});