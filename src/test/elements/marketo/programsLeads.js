'use strict';

const cloud = require('core/cloud');
const suite = require('core/suite');
const tools = require('core/tools');
const fs = require('fs');
const expect = require('chakram').expect;
const namePayload = tools.requirePayload(`${__dirname}/assets/programs-create.json`);
const bulkPayload = tools.requirePayload(`${__dirname}/assets/programsLeads-bulkCsv.json`);
const bulkJsonPayload = tools.requirePayload(`${__dirname}/assets/programsLeads-bulkJson.json`);

suite.forElement('marketing', 'programsLeads', () => {
  let programId, programName;

  before(() => {
    return cloud.post(`/hubs/marketing/programs`, namePayload)
      .then(r => {
        programId = r.body.id;
        programName = r.body.name;
      });
  });

  it(`should allow bulk upload using CSV file for /hubs/marking/bulk/programsLeads`, () => {
    let bulkId;
    const filePath = `${__dirname}/assets/programsLeads-create.csv`;
    bulkPayload.programName = programName;
    const options = { formData: { metaData: JSON.stringify(bulkPayload) } };
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
                let expectedResult = ['Engaged', 'Engaged'];
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
    bulkJsonPayload.programName = programName;
    const options = { formData: { metaData: JSON.stringify(bulkJsonPayload) } };
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
                let expectedResult = ['Member', 'Member'];
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
