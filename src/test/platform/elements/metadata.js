'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const cloud = require('core/cloud');
const metadataSchema = require('./assets/element.metadata.schema.json');
const metadataExpandedSchema = require('./assets/element.metadata.expanedschema.json');

const opts = { schema: metadataSchema };

suite.forPlatform('elements/metadata', opts, (test) => {

  it('should get all elements metadata', () => {
    return cloud.get('elements/metadata', (r) => {
      expect(r).to.have.statusCode(200);
      expect(r.body).to.not.be.empty;
    });
  });

  it('should return element metadata', () => {
    return cloud.get('elements/sfdc')
      .then(r => cloud.get(`elements/${r.body.id}/metadata`, metadataSchema));
  });

  it('should return element metadata for expand', () => {
    //Getting a cloning issue with closeio, so hard coded closeio id
    return cloud.get(`/elements/146/metadata?expand=true`, metadataExpandedSchema);
  });

  it('should return 404 for invalid element ID', () => {
    return cloud.get('elements/999999999999/metadata', (r) => expect(r).to.have.statusCode(404));
  });

  it('should return polling event metadata for polling element', () => {
    return cloud.get('elements/netsuitecrm')
      .then(r => {
        return cloud.get(`elements/${r.body.id}/metadata`, (r) => {
          expect(r).to.have.statusCode(200);
          expect(r.body).to.not.be.empty;
          expect(r.body.events.supported).to.equal(true);
          expect(r.body.events.methods).to.contain('polling');
          expect(r.body.events.polling).to.not.be.empty;
        });
      });
  });

  it('should return webhook event metadata for webhook element', () => {
    return cloud.get('elements/dropbox')
      .then(r => {
        return cloud.get(`elements/${r.body.id}/metadata`, (r) => {
          expect(r).to.have.statusCode(200);
          expect(r.body).to.not.be.empty;
          expect(r.body.events.supported).to.equal(true);
          expect(r.body.events.methods).to.contain('webhook');
        });
      });
  });
});
