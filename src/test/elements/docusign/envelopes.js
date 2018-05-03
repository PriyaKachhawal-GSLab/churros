'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const cloud = require('core/cloud');
const fs = require('fs');
const createPayload = require('./assets/envelopes.create.json');
const updatePayload = require('./assets/envelopes.update.json');
const schema = require('./assets/envelope.schema.json');
const envelopesSchema = require('./assets/envelopes.schema.json');
const documentsSchema = require('./assets/documents.schema.json');
const recipient = require('./assets/envelopes.recipient.json');
const tab = require('./assets/recipients.tab.json');
const documents = require('./assets/envelopes.documents.json');
const patchDocument = require('./assets/envelopes.patchDocument.json');

suite.forElement('esignature', 'envelopes', (test) => {
  it(`should support CRU on ${test.api}`, () => {
    let envelopeId = "-1";
    let path = __dirname + '/assets/MrRobotPdf.pdf';
    const opts = { formData: { envelope: JSON.stringify(createPayload) } };

    return cloud.withOptions(opts).postFile(test.api, path)
      .then(r => envelopeId = r.body.envelopeId)
      .then(r => cloud.get(`${test.api}/${envelopeId}`, (r) => expect(r).to.have.schemaAnd200(schema)))
      .then(r => cloud.patch(`${test.api}/${envelopeId}`, updatePayload, (r) => expect(r).to.have.statusCode(200)))
      .then(r => cloud.get(`${test.api}/${envelopeId}/custom_fields`));
  });

  it(`should support C on ${test.api}, SRUD ${test.api}/:id/documents`, () => {
    let envelopeId = "-1";
    let path = __dirname + '/assets/MrRobotPdf.pdf';
    let documentPath = __dirname + '/assets/Test.pdf';
    const opts = { formData: { envelope: JSON.stringify(createPayload) } };
    let documentId;
    const putDocuments = { formData: { document: JSON.stringify(documents), file: fs.createReadStream(documentPath) } };
    const patchDocuments = { formData: { document: JSON.stringify(patchDocument), file: fs.createReadStream(documentPath) } };

    return cloud.withOptions(opts).postFile(test.api, path)
      .then(r => envelopeId = r.body.envelopeId)
      .then(r => cloud.get(`${test.api}/${envelopeId}/documents`,
        (r) => expect(r).to.have.schemaAnd200(documentsSchema)))
      .then(r => cloud.withOptions(putDocuments).put(`${test.api}/${envelopeId}/documents`, undefined,
        (r) => expect(r).to.have.schemaAnd200(documentsSchema)))
      .then(r => cloud.get(`${test.api}/${envelopeId}/documents`))
      .then(r => documentId = r.body[0].documentId)
      .then(r => cloud.withOptions(patchDocuments).patch(`${test.api}/${envelopeId}/documents/${documentId}`, undefined,
        (r) => expect(r).to.have.schemaAnd200(documentsSchema)))
      .then(r => cloud.get(`${test.api}/${envelopeId}/documents/${documentId}`)
      .then(r => cloud.delete(`${test.api}/${envelopeId}/documents/${documentId}`)));
  });

  it(`should support Ceql search on ${test.api} and S on ${test.api}/:id/documents/certificates`, () => {
    let envelopeId;
    return cloud.withOptions({ qs: { where: 'from_date=\'2015-01-01T00:00:00Z\'' } }).get(test.api)
      .then(r => envelopeId = r.body.filter(function(el) {
        return el.status === 'sent';
      })[0].envelopeId)
      .then(r => cloud.get(`${test.api}/${envelopeId}/documents/certificates`));
  });

  it(`should support CR on ${test.api}/:id/recipients and ${test.api}/:id/recipients/:id/tabs`, () => {
    let envelopeId = "-1";
    let path = __dirname + '/assets/MrRobotPdf.pdf';
    const opts = { formData: { envelope: JSON.stringify(createPayload) } };

    return cloud.withOptions(opts).postFile(test.api, path)
      .then(r => envelopeId = r.body.envelopeId)
      .then(r => cloud.post(`${test.api}/${envelopeId}/recipients`, recipient))
      .then(r => cloud.post(`${test.api}/${envelopeId}/recipients/${recipient.agents[0].recipientId}/tabs`, tab))
      .then(r => cloud.get(`${test.api}/${envelopeId}/recipients`))
      .then(r => cloud.withOptions({ qs: { where: 'include_tabs=\'true\'' } }).get(`${test.api}/${envelopeId}/recipients`))
	  .then(r => {
        expect(r).to.have.statusCode(200);
        expect(r.body).to.not.be.undefined;
        expect(r.body.tabs).to.not.be.null;
      });
  });

  test.withValidation(envelopesSchema)
    .withOptions({ qs: { where: 'from_date=\'2015-01-01T00:00:00Z\'' } })
    .should
    .return200OnGet();
});
