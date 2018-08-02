'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const cloud = require('core/cloud');
const provisioner = require('core/provisioner');
const oneModelElementJson = require('./assets/models/onemodel_element.json');
const contactsMetadata = require('./assets/models/updated_contacts_metadata.json');

suite.forPlatform('element-model', {}, (test) => {
  let oneModelElement;
  let oneModelInstance;
  before(() => cloud.post('elements', oneModelElementJson)
      .then(r => oneModelElement = r.body)
      .then(r => provisioner.create('onemodel', undefined, 'elements/onemodel/instances'))
      .then(r => oneModelInstance = r.body));


  it('should support calling combined/merged objectnames for instance', () => {
      return cloud.get(`/hubs/general/objects`, (r) => {
          expect(r.body).to.not.be.empty;
          expect(r.body).to.be.array;
          expect(r.body).to.have.length(1);
          expect(r.body[0]).to.equal('contacts');
      });
  });

  it('should support calling combined/merged metadata for instance', () => {
      return cloud.get(`/hubs/general/objects/contacts/metadata`, (r) => {
          expect(r.body).to.not.be.empty;
          expect(r.body.fields).to.be.array;
          expect(r.body.fields).to.have.length(38);
          expect(r.body).to.deep.equal(contactsMetadata);
      });
  });

  after(() => {
    return provisioner.delete(oneModelInstance.id, 'elements/onemodel/instances')
        .then(r => cloud.delete(`elements/${oneModelElement.id}`));
  });
});
