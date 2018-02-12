'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/calendars.json`);
const cloud = require('core/cloud');

suite.forElement('general', 'calendars', { payload: payload }, (test) => {
  test.should.supportCrud();
  test.should.supportPagination();
  // the CEQL values are hard coded in do to a problem with microsoft api's that don't allow you to create a calendar, query, and delete it
  it('should allow CEQL', () => {
    test.withName(`should support searching ${test.api} by name`)
    .withOptions({ qs: { where: `name ='sample for display7'` } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.name == 'sample for display7');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
  });

});
