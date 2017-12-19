'use strict';

const cloud = require('core/cloud.js');
const expect = require('chakram').expect;
const faker = require('faker');
const suite = require('core/suite');
const tools = require('core/tools');

// -- GET /reports/metadata passes back a hard-coded payload --
let reportsMetadataResponse = tools.requirePayload(`${__dirname}/assets/reports-metadataResponse.json`);    

suite.forElement('finance', 'reports', (test) => {
    afterEach(done => {
        // to avoid rate limit errors
        setTimeout(done, 5000);
    });
    
    let reports = reportsMetadataResponse.filter(report => report.required.length === 0);
    let contactReports = reportsMetadataResponse.filter(report => report.required[0] === 'contactId');
    let bankAccountReports = reportsMetadataResponse.filter(report => report.required[0] === 'bankAccountId');
    
    const contactWrap = (contactReportCallback) => {
        let contactId;
        let vendorPayload = tools.requirePayload(`${__dirname}/assets/contact.json`);    
        vendorPayload.Name = faker.name.findName(); 
        return cloud.post('/vendors', vendorPayload)
        .then(r => contactId = r.body.ContactID)
        .then(() => contactReportCallback(contactId))
        .then(() => cloud.delete(`/vendors/${contactId}`));
    };
    
    it('should support GET /reports/metadata', () => {
        return cloud.get(`${test.api}/metadata`)
        .then(r => {
            expect(r.body).to.not.be.empty;
            expect(r.body).to.deep.equal(reportsMetadataResponse);
        });
    });

    it('should support GET /reports/:id for all standard reports', () => {
        return Promise.all(
            reports.map(report => {
                let id = report.id;
                return cloud.get(`${test.api}/${id}`)
                .then(r => expect(r.body).to.not.be.empty);
            })
        );
    });
                
    
    it('should support GET /reports/:id for all bank account reports', () => {
        return Promise.all(
            bankAccountReports.map(report => {
                let bankAccountId;
                return cloud.get(`/ledger-accounts`)
                .then(r => bankAccountId = r.body.filter(account => account.Type === 'BANK')[0].AccountID)
                .then(() => cloud.withOptions({qs: {where: `${report.required[0]}='${bankAccountId}'` }}).get(`${test.api}/${report.id}`))
                .then(r => expect(r.body.ReportID).to.equal(`${report.id}`));
            })
        );
    });
                

    
    it('should support GET /reports/:id for all contact reports', () => {
        return Promise.all(
            contactReports.map(report => {
                const contactReportCallback = (contactId) => {
                    return cloud.withOptions({qs: {where: `${report.required[0]}='${contactId}'` }}).get(`${test.api}/${report.id}`)
                    .then(r => expect(r.body.ReportID).to.equal(report.id));
                };
                return contactWrap(contactReportCallback);   
            })
        );
    });
});