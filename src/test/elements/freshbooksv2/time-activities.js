'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const cloud = require('core/cloud');
const createProjectPayload = tools.requirePayload(`${__dirname}/assets/projectsCreate.json`);


const insertProjectId = (payload, projectId) => {
    payload.project_id = projectId;
    payload.started_at = new Date();
    return payload;
};

suite.forElement('finance', 'time-activities', null, (test) => {

    let createPayload, updatePayload, projectId;

    before(() => cloud.post(`hubs/finance/projects`, createProjectPayload)
        .then(r => {
            projectId = r.body.id;
            createPayload = insertProjectId(tools.requirePayload(`${__dirname}/assets/timeActivitiesCreate.json`), projectId);
            updatePayload = insertProjectId(tools.requirePayload(`${__dirname}/assets/timeActivitiesUpdate.json`), projectId);
        }));

    test.should.supportPagination();
    it('should allow CRUDS for employees', () => {
        let tId;
        return cloud.post(test.api, createPayload)
            .then(r => tId = r.body.id)
            .then(r => cloud.get(`${test.api}/${tId}`))
            .then(r => cloud.patch(`${test.api}/${tId}`, updatePayload))
            .then(r => cloud.delete(`${test.api}/${tId}`))
            .then(r => cloud.get(test.api))
            .then(r => expect(r.body.filter(obj => (obj.project_id !== null && obj.project_id !== undefined))).to.not.be.empty);
    });

    test.withApi(test.api)
        .withOptions({ qs: { where: "billable='false'" } })
        .withValidation(r => expect(r.body.filter(obj => obj.billable === false)).to.not.be.empty)
        .withName('should allow GET with option `billable`')
        .should.return200OnGet();
});