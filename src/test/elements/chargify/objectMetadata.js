'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;

suite.forElement('payment', 'objectMetadata', (test) => {
  test
    .withApi(`/objects/subscriptions/metadata`)
    .withValidation(r => {
      expect(r).to.have.statusCode(200);
      expect(r.body.fields).to.not.be.empty;
      const customValues = r.body.fields.filter(field => field.custom && field.custom === true);
      const nonCustomValues = r.body.fields.filter(field => !field.custom);
      expect(customValues.concat(nonCustomValues)).to.have.lengthOf(r.body.fields.length);
    }).should.supportValidation('GET');

  test
    .withApi(`/objects/subscriptions/metadata`)
    .withName('should allow GET /objects/subscriptions/metadata?customFieldsOnly=true')
    .withOptions({ qs: { customFieldsOnly: true } })
    .withValidation(r => {
      expect(r).to.have.statusCode(200);
      expect(r.body.fields).to.be.empty;
      const customValues = r.body.fields.filter(field => field.custom && field.custom === true);
      expect(customValues).to.deep.equal(r.body.fields);
    }).should.supportValidation('GET');

  test
    .withApi(`/objects/invoices/metadata`)
    .withName('should expect GET /objects/invoices/metadata?customFieldsOnly=true to be empty')
    .withOptions({ qs: { customFieldsOnly: true } })
    .withValidation(r => {
      expect(r).to.have.statusCode(200);
      expect(r.body.fields).to.be.empty;
    }).should.supportValidation('GET');

  test
    .withApi(`/objects/garbage/metadata`)
    .withName('should expect an error from an invalid objectName')
    .withValidation(r => expect(r).to.have.statusCode(404))
    .should.supportValidation('GET');
});
