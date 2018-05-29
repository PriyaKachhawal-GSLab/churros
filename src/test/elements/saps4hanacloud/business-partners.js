'use strict';

const suite = require('core/suite');
const payload = require('core/tools').requirePayload(`${__dirname}/assets/business-partners.json`);


let options = {
  churros : {
    updatePayload: {
      "LastName": "UpdateLastName"
    }
  }
};

suite.forElement('erp', 'business-partners', { payload: payload }, (test) => {
  test.withOptions(options).should.supportCrus();
  test.withOptions({ qs: { where: 'BusinessPartner=\'21\'' } }).should.return200OnGet();  
  test.should.supportPagination();
});
