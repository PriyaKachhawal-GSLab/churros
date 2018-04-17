'use strict';

//dependencies at the top
const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const resources = require('./assets/objects');

suite.forElement('crm', 'metadata', (test) => {

  test.withApi('/hubs/crm/objects') //using specified api
    .withValidation(r => expect(r.body).to.include('Account')) //validating the response is what we expect
    .withName('should test objects api') //changes the name of the test
    .should.return200OnGet();

  const metaValid = r => {
    let metadata = r.body.fields[0];
    expect(r).to.have.statusCode(200);
    expect(metadata.filterable).to.exist;
    expect(metadata.createable).to.exist;
    expect(metadata.updateable).to.exist;
  };

  const validEmail = (r) => {
    expect(r).to.have.statusCode(200);
    expect(r.body.fields).to.not.be.null;
    expect(r.body.fields).to.be.an('array');
    let email = r.body.fields.find((obj) => { return obj.vendorPath === 'Email'; });
    expect(email).to.not.be.null;
    expect(email.filterable).to.exist;
    expect(email.createable).to.exist.and.to.be.true;
    expect(email.updateable).to.exist.and.to.be.true;
    return true;
  };

  const validVdrMetadata = r => {
    expect(r).to.have.statusCode(200);
    expect(r.body.fields).to.be.an.array;
    expect(r.body.fields.length).to.equal(2);

    let field = r.body.fields.find((obj) => { return obj.vendorPath === 'Id'; });
    expect(field).to.not.be.null;
    field = r.body.fields.find((obj) => { return obj.path === 'id'; });
    expect(field).to.not.be.null;

    field = r.body.fields.find((obj) => { return obj.vendorPath === 'Email'; });
    expect(field).to.not.be.null;
    field = r.body.fields.find((obj) => { return obj.path === 'email'; });
    expect(field).to.not.be.null;

    field = r.body.fields.find((obj) => { return obj.vendorPath === 'FirstName'; });
    expect(field).to.be.undefined;
    field = r.body.fields.find((obj) => { return obj.path === 'firstName'; });
    expect(field).to.be.undefined;
  };

  const validateSalutation = (r) => {
    let isPicklist = false;
    r.body.fields.forEach(field => isPicklist =
      (field.vendorPath === 'Salutation' && field.vendorNativeType === 'picklist' &&
        expect(field).to.contain.key('picklistValues')));
    return isPicklist;
  };

  test.withApi('/hubs/crm/objects/contact/metadata') //using specified api
    .withValidation(metaValid) //passing a function to validate response
    .withName('should include filterable, createable, and updateable for metadata') //changes the name of the test
    .should.return200OnGet();

  test.withApi('/hubs/crm/objects/contact/metadata').withValidation(validateSalutation).withName(
    'should include picklist for contact metadata').should.return200OnGet();

  test.withApi('/objects/contacts/metadata').withValidation(metaValid).withName(
    'should include filterable, createable, and updateable for canonical object metadata').should.return200OnGet();

  it('should have email property with filterable, createable, and updateable metadata for VDR', () => {
    return cloud.post('/organizations/objects/churrosTestObject/definitions', resources.churrosTestObject, () => {})
      .then(r => cloud.post('/organizations/elements/sfdc/transformations/churrosTestObject', resources.churrosTestObjectXform, () => {}))
      .then(r => cloud.get('/objects/churrosTestObject/metadata'))
      .then(r => validEmail(r))
      .then(r => cloud.delete('/organizations/elements/sfdc/transformations/churrosTestObject'))
      .then(r => cloud.delete('/organizations/objects/churrosTestObject/definitions'));
  });

  it('should include only mapped fields for VDR metadata', () => {
    return cloud.post('/organizations/objects/churrosTestObject/definitions', resources.churrosTestObject, () => {})
      .then(r => cloud.post('/organizations/elements/sfdc/transformations/churrosTestObject', resources.churrosTestObjectXform, () => {}))
      .then(r => cloud.get('/objects/churrosTestObject/metadata'))
      .then(r => validVdrMetadata(r))
      .then(r => cloud.delete('/organizations/elements/sfdc/transformations/churrosTestObject'))
      .then(r => cloud.delete('/organizations/objects/churrosTestObject/definitions'));
  });

  test.withApi('/objects/contacts/metadata').withValidation(metaValid).withName(
    'should include only defined fields for VDR object metadata').should.return200OnGet();

  test.withApi('/objects/contacts/metadata').withValidation(validateSalutation).withName(
    'should include picklist for canonical contact metadata').should.return200OnGet();

  test.withApi('/objects/contacts/metadata').withOptions({ qs: { useModels: true } }).withValidation(metaValid).withName(
    'should include filterable, createable, and updateable for canonical object metadata').should.return200OnGet();
});
