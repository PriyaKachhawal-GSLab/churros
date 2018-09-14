'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const expect = require('chakram').expect;

suite.forElement('general', 'bulk', null, (test) => {

  it('should support bulk download of filters', () => {
    let bulkId;
    const opts = { qs: { q: 'select * from filters' } };

    // start bulk download
    return cloud.withOptions(opts).post('/hubs/general/bulk/query')
      .then(r => {
        expect(r.body.status).to.equal('CREATED');
        bulkId = r.body.id;
      })
      // get bulk download status
      .then(r => tools.wait.upTo(60000).for(() => cloud.get(`/hubs/general/bulk/${bulkId}/status`, r => {
        expect(r.body.status).to.equal('COMPLETED');
        expect(r.body.recordsCount > 0).to.be.true;
        expect(r.body.recordsFailedCount).to.equal(0);
      })))
      // get bulk download errors
      .then(r => cloud.get(`/hubs/general/bulk/${bulkId}/errors`));
  });
});