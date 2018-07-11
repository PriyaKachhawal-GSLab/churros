'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const cloud = require('core/cloud');
const provisioner = require('core/provisioner');
const rocketzenelement = require('./assets/element.metadata.docs.json');

suite.forPlatform('metadata-docs', {}, (test) => {
  let createdElement, instanceId;
  before(() => cloud.post('elements', Object.assign(rocketzenelement, {objects: []}))
      .then(r => createdElement = r.body)
      .then(r => provisioner.create('rocketzen', undefined, 'elements/rocketzen/instances'))
      .then(r => instanceId = r.body.id));


  it('should return object docs', () => {
      return cloud.get(`/hubs/general/objects/contacts/docs`, (r) => {
        expect(r).to.have.statusCode(200);
        expect(r.body).to.not.be.empty;
        expect(r.body.paths).to.not.be.empty;
        expect(Object.keys(r.body.paths).length).to.equal(2);
        expect(r.body.definitions).to.not.be.empty;
        expect(Object.keys(r.body.definitions).length).to.equal(10);
      });
  });

  it('should return object docs with custom fields when discovery is true', () => {
      return cloud.withOptions({qs: {discovery:true}}).get(`/hubs/general/objects/contacts/docs`, (r) => {
        expect(r).to.have.statusCode(200);
        expect(r.body).to.not.be.empty;
        expect(r.body.paths).to.not.be.empty;
        expect(Object.keys(r.body.paths).length).to.equal(2);
        expect(r.body.definitions).to.not.be.empty;
        expect(Object.keys(r.body.definitions).length).to.equal(11);
        expect(Object.keys(r.body.definitions)).to.include('customobject');
        expect(Object.keys(r.body.definitions.contacts.properties)).to.include('custom_email');
      });
  });

  it('should return object docs with custom fields when discovery is true and basic is true', () => {
      return cloud.withOptions({qs: {discovery:true, basic:true}}).get(`/hubs/general/objects/contacts/docs`, (r) => {
        expect(r).to.have.statusCode(200);
        expect(r.body).to.not.be.empty;
        expect(r.body.paths).to.not.be.empty;
        expect(Object.keys(r.body.paths).length).to.equal(2);
        expect(r.body.definitions).to.not.be.empty;
        expect(Object.keys(r.body.definitions).length).to.equal(11);
        expect(Object.keys(r.body.definitions)).to.include('customobject');
        expect(Object.keys(r.body.definitions.contacts.properties)).to.include('custom_email');
      });
  });


  it('should return object docs with custom fields when discovery is true and resolveReference is true', () => {
      return cloud.withOptions({qs: {discovery:true, basic:true, resolveReferences: true}}).get(`/hubs/general/objects/contacts/docs`, (r) => {
        expect(r).to.have.statusCode(200);
        expect(r.body).to.not.be.empty;
        expect(r.body.paths).to.not.be.empty;
        expect(Object.keys(r.body.paths).length).to.equal(2);
        expect(r.body.definitions).to.not.be.empty;
        expect(Object.keys(r.body.definitions).length).to.equal(6);
        expect(Object.keys(r.body.definitions)).to.not.include('customobject');
        expect(Object.keys(r.body.definitions.contacts.properties)).to.include('custom_email');
      });
  });

  after(() => {
    return provisioner.delete(instanceId, 'elements/rocketzen/instances')
        .then(r => cloud.delete(`elements/${createdElement.id}`));
  });

});
