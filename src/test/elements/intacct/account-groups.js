'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/accountGroups.json`);

suite.forElement('finance', 'account-groups', { payload: payload }, (test) => {
  const modifiedDate = '08/21/2018 07:35:34';
  const options = {
    churros: {
      updatePayload: {
        "TITLE": "CASH"
      }
    }
  };
  test.withOptions(options).should.supportCruds();
  test.should.supportNextPagePagination(2);
  test.withOptions({ qs: { where: `WHENMODIFIED ='${modifiedDate}'` } })
    .withName('should support Ceql WHENMODIFIED search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.WHENMODIFIED = modifiedDate);
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
});
