'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const casesPayload = tools.requirePayload(`${__dirname}/assets/cases.json`);
const expect = require('chakram').expect;

suite.forElement('crm', 'cases', { payload: casesPayload }, (test) => {
  const options = {
    churros: {
      updatePayload: {
          "Case Origin":"Phone"
      }
    }
  };
  test.withOptions(options).should.supportCruds();
  test.should.supportPagination();
  test
    .withOptions({ qs: { where: 'Subject = `Test3`' } })
    .withName('should support search by Subject')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.Subject = `Test3`);
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
});
