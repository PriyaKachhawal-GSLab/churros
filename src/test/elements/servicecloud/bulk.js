'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const expect = require('chakram').expect;

suite.forElement('helpdesk', 'bulk', null, (test) => {
  const opts = { csv: true, json: true };

  it('should support bulk upload of agents', () => {
    let bulkId;

    // start bulk upload
    return cloud.withOptions(opts).postFile('/hubs/helpdesk/bulk/Account', `${__dirname}/assets/agents.csv`)
      .then(r => {
        expect(r.body.status).to.equal('CREATED');
        bulkId = r.body.id;
      })
      // get bulk upload status
      .then(r => tools.wait.upTo(30000).for(() => cloud.get(`/hubs/helpdesk/bulk/${bulkId}/status`, r => {
        expect(r.body.status).to.equal('COMPLETED');
        expect(r.body.recordsCount).to.equal(2);
        expect(r.body.recordsFailedCount).to.equal(0);
      })))
      // get bulk upload errors
      .then(r => cloud.get(`/hubs/helpdesk/bulk/${bulkId}/errors`));
  });

  it('should support bulk download of agents', () => {
    let bulkId;
    const opts = { qs: { q: 'select * from Account' } };

    // start bulk download
    return cloud.withOptions(opts).post('/hubs/helpdesk/bulk/query')
      .then(r => {
        expect(r.body.status).to.equal('CREATED');
        bulkId = r.body.id;
      })
      // get bulk download status
      .then(r => tools.wait.upTo(30000).for(() => cloud.get(`/hubs/helpdesk/bulk/${bulkId}/status`, r => {
        expect(r.body.status).to.equal('COMPLETED');
        expect(r.body.recordsCount > 0).to.be.true;
        expect(r.body.recordsFailedCount).to.equal(0);
      })))
      // get bulk download errors
      .then(r => cloud.get(`/hubs/helpdesk/bulk/${bulkId}/errors`));
  });
});
