'use strict';

const cloud = require('core/cloud');
const suite = require('core/suite');
const tools = require('core/tools');
const fs = require('fs');
const expect = require('chakram').expect;
const programPayload = require('./assets/programs');
const buildProgram = (overrides) => Object.assign({}, programPayload, overrides);

suite.forElement('marketing', 'programsLeads', () => {
    let programId, programName;

    before(() => {
        let payload = buildProgram({ name: tools.randomStr('abcdefghijklmnopqrstuvwxyz', 10) });
        return cloud.post(`/hubs/marketing/programs`, payload)
            .then(r => {
                programId = r.body.id;
                programName = r.body.name;
            });
    });

    it(`should allow bulk upload using CSV file for /hubs/marking/bulk/programsLeads`, () => {
        let bulkId;
        const filePath = `${__dirname}/assets/programsLeads.create.csv`;
        const metaData = {"programName":programName, "programStatus": "Engaged","source":tools.randomStr('abcdefghijklmnopqrstuvwxyz', 10),"identifierFieldName":"email"};
        const options = { formData: { metaData: JSON.stringify(metaData) } };
        return cloud.get(`/hubs/marketing/programs/${programId}`)
            .then((r) => {
                expect(fs.existsSync(filePath)).to.be.true;
                let file = fs.readFileSync(filePath, 'utf8');
                try { file = JSON.parse(file); } catch (e) { file = tools.csvParse(file); }
                expect(file).to.exist;
                // start bulk upload
                return cloud.withOptions(options).postFile(`/hubs/marketing/bulk/programsLeads`, filePath)
                    .then(r => {
                        expect(r.body.status).to.equal('CREATED');
                        bulkId = r.body.id;
                    })
                    .then(r => tools.wait.upTo(120000).for(() => cloud.get(`/hubs/marketing/bulk/${bulkId}/status`, r => {
                        expect(r.body.status).to.equal('COMPLETED');
                        return r;
                    })))
                    .then(r => {
                        expect(r.body.recordsFailedCount).to.equal(0);
                    })
                    .then(() => {
                            return cloud.get(`hubs/marketing/programs/${programId}/leads`)
                                .then(r => {
                                    let expectedResult = [ 'Engaged', 'Engaged' ];
                                    expect(r.body.filter(obj => obj.id).map(obj => obj.membership.progressionStatus)).to.eql(expectedResult);
                                    return r.body.filter(obj => obj.id).map(obj => obj.id);
                                })
                                .then(ids => ids.map(id => cloud.delete(`/hubs/marketing/contacts/${id}`)));
                        });
        });
    });

    it(`should allow bulk upload using JSON file for /hubs/marking/bulk/programsLeads`, () => {
        let bulkId;
        const filePath = `${__dirname}/assets/programsLeads.json`;
        const metaData = {"programName":programName, "programStatus": "Member", "source":tools.randomStr('abcdefghijklmnopqrstuvwxyz', 10),"identifierFieldName":"email","format":"json"};
        const options = { formData: { metaData: JSON.stringify(metaData) } };
        return cloud.get(`/hubs/marketing/programs/${programId}`)
            .then((r) => {
                expect(fs.existsSync(filePath)).to.be.true;
                let file = fs.readFileSync(filePath, 'utf8');
                try { file = JSON.parse(file); } catch (e) { file = tools.csvParse(file); }
                expect(file).to.exist;
                // start bulk upload
                return cloud.withOptions(options).postFile(`/hubs/marketing/bulk/programsLeads`, filePath)
                    .then(r => {
                        expect(r.body.status).to.equal('CREATED');
                        bulkId = r.body.id;
                    })
                    .then(r => tools.wait.upTo(120000).for(() => cloud.get(`/hubs/marketing/bulk/${bulkId}/status`, r => {
                        expect(r.body.status).to.equal('COMPLETED');
                        return r;
                    })))
                    .then(r => {
                        expect(r.body.recordsFailedCount).to.equal(0);
                    })
                    .then(() => {
                        return cloud.get(`hubs/marketing/programs/${programId}/leads`)
                            .then(r => {
                                let expectedResult = [ 'Member', 'Member' ];
                                expect(r.body.filter(obj => obj.id).map(obj => obj.membership.progressionStatus)).to.eql(expectedResult);
                                return r.body.filter(obj => obj.id).map(obj => obj.id);
                            })
                            .then(ids => ids.map(id => cloud.delete(`/hubs/marketing/contacts/${id}`)));
                    });
            });
    });

    after(() => {
        return cloud.delete(`/hubs/marketing/programs/${programId}`);
    });
});
