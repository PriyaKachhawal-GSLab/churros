'use strict';

//dependencies at the top
const suite = require('core/suite');
const expect = require('chakram').expect;

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

  test.withApi('/objects/contacts/metadata').withValidation(validateSalutation).withName(
    'should include picklist for canonical contact metadata').should.return200OnGet();

  test.withApi('/objects/contacts/metadata').withOptions({ qs: { useModels: true } }).withValidation(metaValid).withName(
    'should include filterable, createable, and updateable for canonical object metadata').should.return200OnGet();
});
