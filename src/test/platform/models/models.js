'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const payload = require('./assets/payload.json');
const schema = require('./assets/payload.schema.json');
const listPayload = require('./assets/listPayload.json');
const listSchema = require('./assets/listPayload.schema.json');
const defaultCsvHeaders = ['sampleValue','name','type','format','subFormat','displayName','description','request','response','defaultValue','max','min','precision','nullable','searchOperators','searchNames','mask','enums','conditionalDescription','reference','hidden','primaryKey','readOnly','required','vendorReferenceName','vendorName','customFields','searchable','whereFields','searchableJoins'];

suite.forPlatform('models', {}, (test) => {
  let csvBody;
  it('should generate model schema from payload', () => {
    return cloud.post('/models/invoices/schema', payload)
      .then(r => expect(r.body).to.deep.equal(schema));
  });

  it('should generate model schema from array payload', () => {
    return cloud.post('/models/invoices/schema', listPayload)
      .then(r => expect(r.body).to.deep.equal(listSchema));
  });

  it('should generate csv from payload', () => {
    return cloud.withOptions({ headers: { accept: 'text/csv' }}).post('/models/invoices/csv', payload)
      .then(r => {
        expect(r.response.headers['content-disposition']).to.contain('attachment;');
        expect(r.response.headers['content-type']).to.equal('text/csv');
        expect(r.body).to.not.be.empty;
        csvBody = r.body;
        let bodyHeaders = r.body.split('\n')[0].split(',');
        expect(bodyHeaders).to.include.members(defaultCsvHeaders);
      });
  });

  it('should generate csv from schema', () => {
    return cloud.withOptions({ headers: { accept: 'text/csv' }, qs: { fromSchema: true }}).post('/models/invoices/csv', schema)
      .then(r => {
        expect(r.response.headers['content-disposition']).to.contain('attachment;');
        expect(r.response.headers['content-type']).to.equal('text/csv');
        expect(r.body).to.not.be.empty;
        let bodyHeaders = r.body.split('\n')[0].split(',');
        expect(bodyHeaders).to.include.members(defaultCsvHeaders);
        expect(r.body).to.equal(csvBody);
      });
  });

  it('should generate model schema from csv payload', () => {
    return cloud.postFile('/models/invoices/schema/csv', `${__dirname}/assets/csvPayload.csv`)
      .then(r => expect(r.body).to.deep.equal(schema));
  });

});
