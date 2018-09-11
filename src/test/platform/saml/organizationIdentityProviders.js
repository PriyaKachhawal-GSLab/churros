'use strict';
const suite = require('core/suite');
const payload = require('./assets/identityProvider.json');
const cloud = require('core/cloud');
const chakram = require('chakram');
const expect = chakram.expect;

/**
 * This can only be run by a user
 */
suite.forPlatform('organizations/identity-providers', { payload }, (test) => {
  test.should.supportCruds();

  it(`should support x-forwarded-header for GET /metadata`, () => {
    let idpId;
    return cloud.post(test.api, payload)
      .then(r => idpId = r.body.id)
      .then(r => cloud.withOptions({ headers: { 'x-forwarded-host': 'yaboi.com', Accept: 'text/xml' } }).get(`/authentication/saml/${idpId}/metadata`))
      .then(r => expect(r.body.includes('<?xml version')).to.be.true && expect(r.body.includes('https://yaboi.com/elements/api-v2')).to.be.true)
      .then(r => cloud.delete(`${test.api}/${idpId}`));
  });
});
