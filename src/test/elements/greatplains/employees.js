const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/employee.json`);

suite.forElement('finance', 'employees', {payload:payload},(test) => {
    test.withApi(test.api)
    .withOptions({ qs: { where: `employeeKeyId='ACKE0001'` } })
    .withValidation(r => expect(r.body.filter(obj => obj.employeeKey.id !== "")).to.not.be.empty)
    .withName('should allow GET with option employeeKeyId')
    .should.return200OnGet();
    test.should.supportCruds();
    test.should.supportPagination();
});