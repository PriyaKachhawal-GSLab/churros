'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const cloud = require('core/cloud');
const provisioner = require('core/provisioner');
const noendpointElement = require('./assets/multipleendpoint/noendpoint_element.json');
const noendpointInstanceSchema = require('./assets/multipleendpoint/noendpoint_instance_schema.json');
const noendpointInstancePostSchema = require('./assets/multipleendpoint/noendpoint_instance_postschema.json');

suite.forPlatform('elementbuilder', {}, (test) => {
  let createdNoendpoint;
  let noendpointInstanceId;
  before(() => cloud.delete('/elements/noendpoint').catch(() => {})
    .then(() =>   cloud.post('elements', noendpointElement))
      .then(r => createdNoendpoint = r.body)
      .then(r => provisioner.create('noendpoint', undefined, 'elements/noendpoint/instances'))
      .then(r => noendpointInstanceId = r.body.id));

  it('should support calling multiple endpoint chain requests', () => {
      return cloud.get(`/hubs/general/firstrequest`, (r) => {
          expect(r).to.have.schemaAnd200(noendpointInstanceSchema);
      });
  });

  it('should support calling multiple endpoint chain requests for POST and body', () => {
      return cloud.post(`/hubs/general/firstpost`,{"id": 1}, noendpointInstancePostSchema);
  });

  it('should support calling http in hook requests', () => {
      return cloud.get(`/hubs/general/httprequest`, (r) => {
          expect(r.body).to.not.be.empty;
      });
  });

  it('should support calling https in hook requests', () => {
      return cloud.get(`/hubs/general/httpsrequest`, (r) => {
          expect(r.body).to.not.be.empty;
      });
  });

  it('should fail if chain is more than 5', () => {
      return cloud.get(`/hubs/general/one`, (r) => expect(r).to.have.statusCode(400));
  });

  after(() => {
    return provisioner.delete(noendpointInstanceId, 'elements/noendpoint/instances')
        .then(r => cloud.delete(`elements/${createdNoendpoint.id}`));
  });

});
