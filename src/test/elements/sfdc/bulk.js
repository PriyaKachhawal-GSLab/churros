'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const parentPayload = tools.requirePayload(`${__dirname}/assets/accounts.json`);
const childPayload = tools.requirePayload(`${__dirname}/assets/accounts.json`);
const expect = require('chakram').expect;

suite.forElement('crm', 'bulk', null, (test) => {
  let parentId, childId;
  before(() => cloud.post('/hubs/crm/accounts', parentPayload)
    .then(r => parentId = r.body.id)
    .then(r => childPayload.ParentId = parentId)
    .then(r => cloud.post('/hubs/crm/accounts', childPayload))
    .then(r => childId = r.body.id));

  after(() => cloud.delete(`/hubs/crm/accounts/${parentId}`)
    .then(r => cloud.delete(`/hubs/crm/accounts/${childId}`)));

  it('should support parent references', () => {
    let bulkId;
    const opts = { qs: { q: `select Name, Parent.Name from Account where Name='${childPayload.name}'` } };

    // start bulk download
    return cloud.withOptions(opts).post('/hubs/crm/bulk/query')
      .then(r => {
        expect(r.body.status).to.equal('CREATED');
        bulkId = r.body.id;
      })
      // get bulk download status
      .then(r => tools.wait.upTo(30000).for(() => cloud.get(`/hubs/crm/bulk/${bulkId}/status`, r => {
        expect(r.body.status).to.equal('COMPLETED');
        expect(r.body.recordsCount > 0).to.be.true;
        expect(r.body.recordsFailedCount).to.equal(0);
      })))
      .then(r => cloud.withOptions({ headers: { accept: "text/csv" } }).get(`/hubs/crm/bulk/${bulkId}/accounts`, r => {
        expect(r.body).to.contain('Name,Parent.Name');
        expect(r.body).to.contain(`${childPayload.name},${parentPayload.name}`);
      }));
  });

});
