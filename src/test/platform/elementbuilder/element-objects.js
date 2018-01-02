'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const cloud = require('core/cloud');
const provisioner = require('core/provisioner');
const oneModelElementJson = require('./assets/objects/onemodel_element.json');
const contactsMetadata = require('./assets/objects/contacts_metadata.json');
const swaggerParser = require('swagger-parser');

suite.forPlatform('element-objects', {}, (test) => {
  let oneModelElement;
  let oneModelInstance;
  before(() => cloud.post('elements', oneModelElementJson)
      .then(r => oneModelElement = r.body)
      .then(r => provisioner.create('onemodel', undefined, 'elements/onemodel/instances'))
      .then(r => oneModelInstance = r.body));


  it('should support calling objectnames for instance', () => {
      return cloud.get(`/hubs/general/objects`, (r) => {
          expect(r.body).to.not.be.empty;
          expect(r.body).to.be.array;
          expect(r.body).to.have.length(1);
          expect(r.body[0]).to.equal('contacts');
      });
  });

  it('should support calling objects metadata for instance', () => {
      return cloud.get(`/hubs/general/objects/contacts/metadata`, (r) => {
          expect(r.body).to.not.be.empty;
          expect(r.body.fields).to.be.array;
          expect(r.body.fields).to.have.length(8);
          expect(r.body).to.deep.equal(contactsMetadata);
      });
  });


  it('should support calling generating swagger docs for the instance', () => {
      return cloud.get(`/elements/${oneModelElement.id}/docs`, (r) => {
          expect(r.body).to.not.be.empty;
          let docs = r.body;
          expect(docs.paths).to.not.be.empty;
          expect(docs.paths['/contacts']).to.not.be.empty;
          let contacts = docs.paths['/contacts'];
          expect(contacts.post).to.not.be.empty;
          expect(contacts.post.parameters).to.not.be.empty;
          let postbodyParam = contacts.post.parameters.filter(p => p['in'] === 'body')[0];
          expect(postbodyParam).to.not.be.empty;
          expect(postbodyParam.schema).to.not.be.empty;
          expect(postbodyParam.schema.properties).to.not.be.empty;
          expect(postbodyParam.schema['x-vendor-objectname']).to.not.be.empty;
          swaggerParser.validate(r.body);
      });
  });

  after(() => {
    return provisioner.delete(oneModelInstance.id, 'elements/onemodel/instances')
        .then(r => cloud.delete(`elements/${oneModelElement.id}`));
  });
});
