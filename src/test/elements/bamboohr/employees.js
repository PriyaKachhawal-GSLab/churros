const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/employee.json`);
const categoriesPayload = tools.requirePayload(`${__dirname}/assets/categories.json`);
const attachmentUpdatePayload = tools.requirePayload(`${__dirname}/assets/updateAttachment.json`);
var empId = 0;
var categoryId;

suite.forElement('humancapital', 'employees', { payload: payload }, (test) => {
    before(() => {
        return cloud.get('employees')
            .then(r => empId = r.body[0].id)
            .then(r => cloud.get(`${test.api}/${empId}/categories/attachments`))
            .then(r => categoryId = r.body[0].id);
    });
    test.should.supportCrus();
    it(`should allow C for ${test.api}/categories`, () => {
        return cloud.post(`${test.api}/categories`, categoriesPayload);
    });
    let txtFile = __dirname + '/assets/History.txt';

    it(`should allow Cruds for ${test.api}/${empId}/categories/{categoryId}/attachments`, () => {
        let attachmentId;
        let query = { fileName: tools.random(), share: 'yes' };
        return cloud.withOptions({ qs: query }).postFile(`${test.api}/${empId}/categories/${categoryId}/attachments`, txtFile)
            .then(r => attachmentId = r.body.id)
            .then(r => cloud.get(`${test.api}/${empId}/categories/${categoryId}/attachments/${attachmentId}`))
            .then(r => cloud.patch(`${test.api}/${empId}/categories/${categoryId}/attachments/${attachmentId}`, attachmentUpdatePayload))
            .then(r => cloud.delete(`${test.api}/${empId}/categories/${categoryId}/attachments/${attachmentId}`))
            .then(r => cloud.get(`${test.api}/${empId}/categories/attachments`));
    });
});