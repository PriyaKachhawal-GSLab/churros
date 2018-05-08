'use strict';

//dependencies at the top
const suite = require('core/suite');
const expect = require('chakram').expect;

suite.forElement('ecommerce', 'metadata', (test) => {

  test.withApi('/hubs/ecommerce/objects') //using specified api
    .withValidation(r => expect(r.body).to.include('product')) //validating the response is what we expect
    .withName('should test objects api') //changes the name of the test
    .should.return200OnGet();

  const validTitle = (r) => {
    expect(r).to.have.statusCode(200);
    expect(r.body.fields).to.not.be.null;
    expect(r.body.fields).to.be.an('array');
    let title = r.body.fields.find((obj) => { return obj.vendorPath === 'title'; });
    expect(title).to.not.be.null;
    return true;
  };

  test.withApi('/hubs/ecommerce/objects/product/metadata') //using specified api
    .withValidation(validTitle) //passing a function to validate response
    .withName('should include metadata for title') //changes the name of the
    // test
    .should.return200OnGet();
});
