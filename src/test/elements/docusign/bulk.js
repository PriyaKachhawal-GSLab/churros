'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const expect = require('chakram').expect;
const argv = require('optimist').argv;

suite.forElement('esignature', 'bulk', null, (test) => {

  it('should support bulk download of envelopes', () => {
    let bulkId;
    const opts = { qs: { q: 'select * from envelopes' } };

    // start bulk download
    return cloud.withOptions(opts).post('/hubs/marketing/bulk/query')
      .then(r => {
        expect(r.body.status).to.equal('CREATED');
        bulkId = r.body.id;
      })
      // get bulk download status
      .then(r => tools.wait.upTo(30000).for(() => cloud.get(`/hubs/marketing/bulk/${bulkId}/status`, r => {
        expect(r.body.status).to.equal('COMPLETED');
        expect(r.body.recordsCount > 0).to.be.true;
        expect(r.body.recordsFailedCount).to.equal(0);
      })))
      .then(r => cloud.get(`/hubs/marketing/bulk/${bulkId}/envelopes`, r => {
        expect(r.body).to.contain('envelopeId');
      }))
      // get bulk download errors
      .then(r => cloud.get(`/hubs/marketing/bulk/${bulkId}/errors`));
  });
});
