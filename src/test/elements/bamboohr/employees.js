const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/employee.json`);
const categoriesPayload = tools.requirePayload(`${__dirname}/assets/categories.json`);
const attachmentUpdatePayload = tools.requirePayload(`${__dirname}/assets/updateAttachment.json`);

suite.forElement('humancapital', 'employees', { payload: payload }, (test) => {
    let empId, categoryId;

    before(() => {
        return cloud.get('employees')
            .then(r => empId = r.body[0].id)
            .then(r => cloud.get(`${test.api}/${empId}/categories/attachments`))
            .then(r => categoryId = r.body[0].id);
    });
    test.should.supportCrus();
    test.withJson(categoriesPayload).should.return200OnPost();
    // it(`should allow C for ${test.api}/categories`, () => {
    //     return cloud.post(`${test.api}/categories`, categoriesPayload);
    // });
    it(`should allow Cruds for ${test.api}/:empId/categories/:categoryId/attachments`, () => {
        let txtFile = `${__dirname}/assets/History.txt`, attachmentId, query = { fileName: tools.random(), share: 'yes' };
        return cloud.withOptions({ qs: query }).postFile(`${test.api}/${empId}/categories/${categoryId}/attachments`, txtFile)
            .then(r => attachmentId = r.body.id)
            .then(r => cloud.get(`${test.api}/${empId}/categories/${categoryId}/attachments/${attachmentId}`))
            .then(r => cloud.patch(`${test.api}/${empId}/categories/${categoryId}/attachments/${attachmentId}`, attachmentUpdatePayload))
            .then(r => cloud.delete(`${test.api}/${empId}/categories/${categoryId}/attachments/${attachmentId}`))
            .then(r => cloud.get(`${test.api}/${empId}/categories/attachments`));
    });
});