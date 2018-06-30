'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/agents.json`);

const options = {
  churros: {
    updatePayload: {
      "manager": "",
      "location": "",
      "street": "123 Update Street",
      "city": "Denver",
      "web_service_access_only": "false",
      "vip": "false",
      "first_name": "Churros",
      "middle_name": "P.",
      "country": "US",
      "email": "claude-update@churros.com",
      "roles": "",
      "last_name": "UPDATE",
      "active": "true",
      "state": "CO",
      "zip": "80203"
    }
  }
};

suite.forElement('helpdesk', 'agents', { payload: payload }, (test) => {
  test.should.supportPagination();
  test.withOptions(options).should.supportCruds();
  test.withName('should allow >= Ceql search').withOptions({ qs: { where: 'sys_created_on>=\'2014-11-17T23:15:20\'' } }).should.return200OnGet();
});
