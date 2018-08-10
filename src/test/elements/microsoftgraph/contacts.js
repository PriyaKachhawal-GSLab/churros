'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/contacts.json`);
const expect = require('chakram').expect;

suite.forElement('general', 'contacts', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.should.supportPagination();
  test.withName(`should support searching ${test.api} by name`)
    .withOptions({ qs: { where: `DisplayName ='Churros Name'` } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.name === 'Churros Name');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();

  test
    .withOptions({ qs: { orderBy: `lastModifiedDateTime desc` } })
    .withName('Should support orderBy for date')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      expect(r.body.length).to.be.at.least(2);
      const success = new Date(r.body[0].lastModifiedDateTime).getTime() > new Date(r.body[1].lastModifiedDateTime).getTime();
      expect(success).to.be.true;
    })
    .should.return200OnGet();
});
