'use strict';

const suite = require('core/suite');
const payload = require('./assets/contacts');
const chakram = require('chakram');

const options = {
  churros: {
    updatePayload: {
      "firstName": "test_1",
      "portalPassword": "Churros@123"
    }
  }
};

suite.forElement('crm', 'contacts', { payload: payload }, (test) => {
  test.withOptions(options).should.supportCruds(chakram.put); //test put
  test.withOptions(options).should.supportCruds(); //test patch
  test.should.supportPagination('id');
  test.should.supportCeqlSearch('id');
  test.withName(`should support searching ${test.api} by email`).withOptions({ qs: { where: `email='Test'` } }).should.return200OnGet();
});
