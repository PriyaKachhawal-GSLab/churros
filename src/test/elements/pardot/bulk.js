'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');

suite.forElement('marketing', 'bulk', null, (test) => {

    it('should support bulk upload of more than 50 prospects', () => {
        let bulkId;
        // start bulk upload
        return cloud.postFile('/hubs/marketing/bulk/prospect', __dirname + `/assets/multiple.prospects.csv`)
            .then(r => {
                expect(r.body.status).to.equal('CREATED');
                bulkId = r.body.id;
            })
            // get bulk upload status
            .then(r => tools.wait.upTo(30000).for(() => cloud.get(`/hubs/marketing/bulk/${bulkId}/status`, r => {
                expect(r.body.status).to.equal('COMPLETED');
                expect(r.body.recordsCount).to.equal(60);
                expect(r.body.recordsFailedCount).to.equal(0);
            })));
    });

    it('should report an error on a bulk upload with no key (email/id)', () => {
        let bulkId;
        // start bulk upload
        return cloud.postFile('/hubs/marketing/bulk/prospect', __dirname + `/assets/no.key.prospect.csv`)
            .then(r => {
                expect(r.body.status).to.equal('CREATED');
                bulkId = r.body.id;
            })
            // get bulk upload status
            .then(r => tools.wait.upTo(30000).for(() => cloud.get(`/hubs/marketing/bulk/${bulkId}/status`, r => {
                expect(r.body.status).to.equal('ABORTED');
                expect(r.body.error).to.equal("All prospects require either 'email' or 'id'");
            })));
    });

    it('should report an error on a bulk upload with an invalid field', () => {
        let bulkId;
        // start bulk upload
        return cloud.postFile('/hubs/marketing/bulk/prospect', __dirname + `/assets/invalid.field.prospect.csv`)
            .then(r => {
                expect(r.body.status).to.equal('CREATED');
                bulkId = r.body.id;
            })
            // get bulk upload status
            .then(r => tools.wait.upTo(30000).for(() => cloud.get(`/hubs/marketing/bulk/${bulkId}/status`, r => {
                expect(r.body.status).to.equal('COMPLETED');
                expect(r.body.recordsCount).to.equal(1);
                expect(r.body.recordsFailedCount).to.equal(1);
            })))
            // get bulk upload errors
            .then(r => cloud.get(`/hubs/marketing/bulk/${bulkId}/errors`))
            .then(r => expect(r.body[0].status).to.equal("74234: Invalid prospect email address"));
    });
});
