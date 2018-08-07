'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/contacts.json`);

suite.forElement('general', 'contacts', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.should.supportPagination('Id');

  test
    .withOptions({ qs: { orderBy: `LastModifiedDateTime desc` } })
    .withName('Should support orderBy for date')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      expect(r.body.length).to.be.at.least(2);
      const success = new Date(r.body[0].LastModifiedDateTime).getTime() > new Date(r.body[1].LastModifiedDateTime).getTime();
      expect(success).to.be.true;
    })
    .should.return200OnGet();

  test
    .withOptions({ qs: { where: `LastModifiedDateTime >= '2018-08-07T06:45:27Z'` } })
    .withName('Should support Ceql date search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.LastModifiedDateTime >= '2018-08-07T06:45:27Z');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
});
