'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/contacts.json`);

const options = {
  churros: {
    updatePayload: {
      "manager": "",
      "location": "",
      "street": "123 Update Street",
      "city": "Denver",
      "web_service_access_only": "false",
      "vip": "false",
      "first_name": "Claudey",
      "middle_name": "P.",
      "country": "US",
      "email": "claudey@churros.com",
      "roles": "",
      "last_name": "UPDATE",
      "active": "true",
      "state": "CO",
      "zip": "80203"
    }
  }
};

suite.forElement('helpdesk', 'contacts', { payload: payload }, (test) => {
  test.should.supportPagination();
  test.withOptions(options).should.supportCruds();
  test.withName('should allow >= Ceql search').withOptions({ qs: { where: 'sys_created_on>=\'2014-02-18T03:04:53\'' } }).should.return200OnGet();
});
