'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;
const cloud = require('core/cloud');
const tools = require('core/tools');
const props = require('core/props');
const resources = require('./assets/objects');

suite.forElement('finance', 'metadata', (test) => {
  const validEmail = (r) => {
    expect(r).to.have.statusCode(200);
    expect(r.body.fields).to.not.be.null;
    expect(r.body.fields).to.be.an('array');
    let email = r.body.fields.find((obj) => {
      return obj.vendorPath === 'email';
    });
    expect(email).to.not.be.null;
    expect(email.filterable).to.exist;
    expect(email.createable).to.exist.and.to.be.true;
    expect(email.updateable).to.exist.and.to.be.true;
    return true;
  };

  const validObjects = (r) => {
    expect(r).to.have.statusCode(200);
    expect(r.body).to.not.be.null;
    expect(r.body).to.be.an('array');

    let vendorObject = r.body.find((obj) => {
      return obj.vendorName === 'Contact';
    });
    expect(vendorObject).to.not.be.null;
    expect(vendorObject.name).to.not.be.null;
    expect(vendorObject.name).to.equal('Contact');
    expect(vendorObject.type).to.not.be.null;
    expect(vendorObject.type).to.equal('vendor');

    let ceObject = r.body.find((obj) => {
      return obj.name === 'payments';
    });
    expect(ceObject).to.not.be.null;
    expect(ceObject.vendorName).to.not.be.null;
    expect(ceObject.vendorName).to.equal('Payment');
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
      return obj.vendorName === 'Contact';
    });
    expect(vendorObject).to.not.be.null;
    expect(vendorObject.name).to.not.be.null;
    expect(vendorObject.name).to.equal('Contact');
    expect(vendorObject.type).to.not.be.null;
    expect(vendorObject.type).to.equal('vendor');
  };

  test.withApi('/objects')
    .withValidation(r => {
      (expect(r).to.have.statusCode(200) && expect(r.body).to.include('Customer'));
    })
    .withName('should test objects api')
    .should.return200OnGet();

  test.withApi('/objects/customers/metadata')
    .withValidation(validEmail)
    .withName('should have email property with filterable, createable, and updateable metadata')
    .should.return200OnGet();

  test.withApi('/objects/credit-memos/metadata')
    .withValidation(validEmail)
    .withName('should have filterable, createable and updateable metadata for email for dashed resource')
    .should.return200OnGet();

  test.withApi('/objects/creditMemos/metadata')
    .withValidation(validEmail)
    .withName('should have filterable, createable and updateable metadata for email for camel case resource')
    .should.return200OnGet();

  it('should test objects helium api', () => {
    return cloud.withOptions({
        headers: {
          "Elements-Version": "Helium"
        }
      }).get('/objects')
      .then(r => validObjects(r));
  });

  it('should have email property with filterable, createable, and updateable metadata for VDR', () => {
    return cloud.post('/organizations/objects/churrosTestObject/definitions', resources.churrosTestObject, () => {})
      .then(r => cloud.post('/organizations/elements/netsuitefinancev2/transformations/churrosTestObject', resources.churrosTestObjectXform, () => {}))
      .then(r => cloud.get('/objects/churrosTestObject/metadata'))
      .then(r => validEmail(r))
      .then(r => cloud.delete('/organizations/elements/netsuitefinancev2/transformations/churrosTestObject'))
      .then(r => cloud.delete('/organizations/objects/churrosTestObject/definitions'));
  });

  it('should retrieve objects for instance when specified', () => {
    let config = props.all('netsuitefinancev2');
    let newInstanceId;

    return cloud.post('/instances', {
        "name": "churros-" + tools.random(),
        "element": {
          "key": "netsuitefinancev2"
        },
        "configuration": {
          "netsuite.sandbox": "false",
          "netsuite.single.session": config['netsuite.single.session'],
          "authentication.type": config['authentication.type'],
          "netsuite.sso.roleId": config['netsuite.sso.roleId'],
          "filter.response.nulls": "true",
          "user.username": config['user.username'],
          "netsuite.accountId": config['netsuite.accountId'],
          "user.password": config['user.password'],
          "netsuite.appId": config['netsuite.appId']
        },
        "retrieveObjectsAfterInstantiation": true
      })
      .then(r => newInstanceId = r.body.id)
      .then(r => validateInstanceWithObjects(r))
      .then(r => cloud.delete(`/instances/${newInstanceId}`))
      .catch(() => cloud.delete(`/instances/${newInstanceId}`));
  });
});
