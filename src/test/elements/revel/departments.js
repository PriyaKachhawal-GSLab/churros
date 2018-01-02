const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const departmentPayload = tools.requirePayload(`${__dirname}/assets/departments.json`);

suite.forElement('employee', 'departments', { payload: departmentPayload }, (test) => {

  test.withValidation(r => expect(r).to.have.statusCode(200)).should.supportCrs();
});
