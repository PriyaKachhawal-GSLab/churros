'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const groupsCreatePayload = tools.requirePayload(`${__dirname}/assets/groups-create.json`);
const groupsUpdatePayload = tools.requirePayload(`${__dirname}/assets/groups-update.json`);

const options = {
  churros: {
    updatePayload: groupsUpdatePayload
  }
};

suite.forElement('helpdesk', 'groups', { payload: groupsCreatePayload }, (test) => {
  test.should.supportPagination();
  test.withOptions(options).should.supportCruds();
});
