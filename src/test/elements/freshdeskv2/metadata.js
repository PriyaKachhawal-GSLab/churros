'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;
const cloud = require('core/cloud');
const resources = require('./assets/objects');

suite.forElement('helpdesk', 'metadata', (test) => {
  const validEmail = (r) => {
    expect(r).to.have.statusCode(200);
    expect(r.body.fields).to.not.be.null;
    expect(r.body.fields).to.be.an('array');
    let email = r.body.fields.find((obj) => { return obj.vendorPath === 'email'; });
    expect(email).to.not.be.null;
    expect(email.createable).to.exist.and.to.be.true;
    expect(email.updateable).to.exist.and.to.be.true;
    return true;
  };

  test.withApi('/objects')
    .withValidation(r => { (expect(r).to.have.statusCode(200) && expect(r.body).to.include('accounts')); })
    .withName('should test objects api')
    .should.return200OnGet();

  test.withApi('/objects/contacts/metadata')
    .withValidation(validEmail)
    .withName('should have email property with createable and updateable metadata')
    .should.return200OnGet();

  it('should have email property with createable and updateable metadata for VDR', () => {
    return cloud.post('/organizations/objects/churrosTestObject/definitions', resources.churrosTestObject, () => {})
      .then(r => cloud.post('/organizations/elements/freshdeskv2/transformations/churrosTestObject', resources.churrosTestObjectXform, () => {}))
      .then(r => cloud.get('/objects/churrosTestObject/metadata'))
      .then(r => validEmail(r))
      .then(r => cloud.delete('/organizations/elements/freshdeskv2/transformations/churrosTestObject'))
      .then(r => cloud.delete('/organizations/objects/churrosTestObject/definitions'));
  });
});
