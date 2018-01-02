'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const cloud = require('core/cloud');
const provisioner = require('core/provisioner');
const rocketzenelement = require('./assets/rocketzen.json');

//This test is for all misc tests for element builder, can use and enhance the rocketzen element
//to include the needed tests

suite.forPlatform('rocketzen', {}, (test) => {
  let createdElement, instanceId;
  before(() => cloud.post('elements', rocketzenelement)
      .then(r => createdElement = r.body)
      .then(r => provisioner.create('rocketzen', undefined, 'elements/rocketzen/instances'))
      .then(r => instanceId = r.body.id));


  it('should return an error calling API request with kind java', () => {
      return cloud.get(`/hubs/general/contacts-nonexec`, (r) => {
        console.log(r.body);
          expect(r.body.message).to.be.equal('This API is not currently supported for this element');
      });
  });

  after(() => {
    return provisioner.delete(instanceId, 'elements/rocketzen/instances')
        .then(r => cloud.delete(`elements/${createdElement.id}`));
  });

});
