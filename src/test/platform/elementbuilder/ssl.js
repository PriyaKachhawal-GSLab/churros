'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const cloud = require('core/cloud');
const provisioner = require('core/provisioner');
const sslElementJson = require('./assets/ssl/ssl_element.json'); //using Visas API (sandbox) for testing purposes

suite.forPlatform('element-ssl', {}, () => {
  let sslElement; 
  let sslInstance;
  before(() => cloud.post('elements', sslElementJson)
    .then(r => sslElement = r.body)
    .then(() => provisioner.create('elementssl', undefined, 'elements/elementssl/instances'))
    .then(r => sslInstance = r.body));

  it(`successfully call endpoint with TLS 1.2`, () => {
    let bankId = '123456';
    return cloud.get(`/hubs/general/bank-net-position/${bankId}`)
      .then(r => expect(r.body.bankId).to.equal(bankId));
  });

  after(() => {
    return provisioner.delete(sslInstance.id, 'elements/elementssl/instances')
      .then(() => cloud.delete(`elements/${sslElement.id}`));
  });
});
