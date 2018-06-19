'use strict';

const suite = require('core/suite');
const chakram = require('chakram');
const expect = chakram.expect;

suite.forPlatform('organizations/:id/accounts', test => {
  suite.forPlatform('organizations/-1/accounts', test => {
    test.should.return404OnGet();
  });

  it('should return accounts when retrieving accounts for an organization', () => {
    let orgId;
    return chakram.get('/organizations/me')
    .then(r => orgId = r.body.id)
    .then(() => chakram.get(`/organizations/${orgId}/accounts`))
    .then(r => expect(r.body).to.not.be.empty);
  });

  it('should return the correct account when retrieving an account for an organization', () => {
    let orgId;
    let acctId;
    return chakram.get('/organizations/me')
    .then(r => orgId = r.body.id)
    .then(() => chakram.get(`/organizations/${orgId}/accounts`))
    .then(r => acctId = r.body[0].id)
    .then(r => chakram.get(`/organizations/${orgId}/accounts/${acctId}`))
    .then(r => expect(r.body.id).to.equal(acctId));
  });

  it('should throw a 404 when retrieving an invalid account in a valid organization', () => {
    let orgId;
    return chakram.get('/organizations/me')
    .then(r => orgId = r.body.id)
    .then(() => chakram.get(`/organizations/${orgId}/accounts/-1`))
    .then(r => expect(r).to.have.status(404));
  });
});
