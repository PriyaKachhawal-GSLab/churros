'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;
const cloud = require('core/cloud');
const tools = require('core/tools');
const props = require('core/props');

suite.forElement('ecommerce', 'metadata', (test) => {
  const validEmail = (r) => {
    expect(r).to.have.statusCode(200);
    expect(r.body.fields).to.not.be.null;
    expect(r.body.fields).to.be.an('array');
    let email = r.body.fields.find((obj) => {
      return obj.vendorPath === 'email';
    });
    expect(email).to.not.be.null;
    expect(email.createable).to.exist.and.to.be.true;
    expect(email.updateable).to.exist.and.to.be.true;
    return true;
  };

  const validObjects = (r) => {
    expect(r).to.have.statusCode(200);
    expect(r.body).to.not.be.null;
    expect(r.body).to.be.an('array');

    let ceObject = r.body.find((obj) => {
      return obj.name === 'customers';
    });
    expect(ceObject).to.not.be.null;
    expect(ceObject.vendorName).to.not.be.null;
    expect(ceObject.vendorName).to.equal('customers');
    expect(ceObject.type).to.not.be.null;
    expect(ceObject.type).to.equal('ceCanonical');
  };

  const validateInstanceWithObjects = (r) => {
    expect(r).to.have.statusCode(200);
    expect(r.body).to.not.be.null;
    expect(r.body).to.be.an('object');

    expect(r.body.objects).to.exist;
    expect(r.body.objects).to.not.be.null;
    expect(r.body.objects).to.be.an('array');
    let vendorObject = r.body.objects.find((obj) => {
      return obj.vendorName === 'customers';
    });
    expect(vendorObject).to.not.be.null;
    expect(vendorObject.name).to.not.be.null;
    expect(vendorObject.name).to.equal('customers');
    expect(vendorObject.type).to.not.be.null;
    expect(vendorObject.type).to.equal('ceCanonical');
  };

  test.withApi('/objects')
    .withValidation(r => {
      (expect(r).to.have.statusCode(200) && expect(r.body).to.include('invoices'));
    })
    .withName('should test objects api')
    .should.return200OnGet();

  test.withApi('/objects/customers/metadata')
    .withValidation(validEmail)
    .withName('should have email property with filterable, createable, and updateable metadata')
    .should.return200OnGet();

  it('should test objects helium api', () => {
    return cloud.withOptions({
        headers: {
          "Elements-Version": "Helium"
        }
      }).get('/objects')
      .then(r => validObjects(r));
  });

  it('should retrieve objects for instance when specified', () => {
    let config = props.all('magentov20');
    let newInstanceId;

    return cloud.post('/instances', {
        "name": "churros-" + tools.random(),
        "element": {
          "key": "magentov20"
        },
        "configuration": {
          "site": config.site,
          "user": config.user,
          "username": config.username,
          "password": config.password,
          "filter.response.nulls": "true"
        },
        "retrieveObjectsAfterInstantiation": true
      })
      .then(r => newInstanceId = r.body.id)
      .then(r => validateInstanceWithObjects(r))
      .then(r => cloud.delete(`/instances/${newInstanceId}`))
      .catch(() => cloud.delete(`/instances/${newInstanceId}`));
  });
});
