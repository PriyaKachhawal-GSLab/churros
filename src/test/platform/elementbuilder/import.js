'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const cloud = require('core/cloud');
const schema = require('./assets/element.schema.json');
const faker = require('faker');

const deleteElementByKey = (key) => cloud.delete(`/elements/${key}`, () => {});

const crudElement = (idField, payload, updatedPayload, schema) => {
  let element, id;
  return deleteElementByKey('churros')
    .then(r => cloud.post('elements', payload, schema))
    .then(r => element = r.body)
    .then(r => id = element[idField])
    .then(r => cloud.get(`elements/${id}`, schema))
    .then(r => cloud.put(`elements/${id}`, updatedPayload, schema))
    .then(r => cloud.delete(`elements/${id}`))
    .catch(e => {
      if (id) cloud.delete(`elements/${id}`);
      throw new Error(e);
    });
};

suite.forPlatform('element import', {}, (test) => {
  it('should support converting and creating a SOAP element', () => {
    let atElement;
    // Call elements/convert to convert wsdl to element
    return cloud.postFile('/elements/convert?type=soap', __dirname + `/assets/import/atws.wsdl`)
      .then(r => {
        expect(r.body).to.not.be.empty;
        expect(r.body.name).to.equal('http://autotask.net/ATWS/v1_5/');
        atElement = r.body;
        atElement.key = `churrosImport${faker.address.zipCode()}`;
      })
      // Create the element
      .then(r => crudElement('key', atElement, atElement, schema));
  });

  it('should support converting and creating a element From Swagger', () => {
    let suElement;
    // Call elements/convert to convert wsdl to element
    return cloud.postFile('/elements/convert?type=swagger', __dirname + `/assets/import/sageoneus.json`)
      .then(r => {
        expect(r.body).to.not.be.empty;
        expect(r.body.name).to.equal('Sage One API v3 accounts US');
        suElement = r.body;
        suElement.key = 'churros';
      })
      // Create the element
      .then(r => crudElement('key', suElement, suElement, schema));
  });

});
