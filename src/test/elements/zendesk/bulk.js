'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const expect = require('chakram').expect;

suite.forElement('helpdesk', 'bulk', null, (test) => {

    const validJson = (r) => {
        expect(r).to.have.statusCode(200);
        expect(r.body).to.not.be.null;
        expect(r.body).to.be.an('array');
        expect(r.body[0].id).to.not.be.null;
        return true;
    };

  it('should support json bulk download for incidents', () => {
    let bulkId;
    const opts = { qs: { q: "select * from incidents" } };

    // start bulk download
    return cloud.withOptions(opts).post('/bulk/query')
      .then(r => {
        expect(r.body.status).to.equal('CREATED');
        bulkId = r.body.id;
      })
      // get bulk download status
      .then(r => tools.wait.upTo(60000).for(() => cloud.get(`/bulk/${bulkId}/status`, r => {
        expect(r.body.status).to.equal('COMPLETED');
        expect(r.body.recordsCount > 0).to.be.true;
        expect(r.body.recordsFailedCount).to.equal(0);
      })))
      .then(r => cloud.withOptions({ headers: { accept: "application/json" }}).get(`/bulk/${bulkId}/incidents`, r => validJson(r)
      ));
  });

});
