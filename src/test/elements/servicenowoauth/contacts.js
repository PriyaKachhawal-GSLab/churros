'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

let contactsCreatePayload = tools.requirePayload(`${__dirname}/assets/contacts-create.json`);
let contactsUpdatePayload = tools.requirePayload(`${__dirname}/assets/contacts-update.json`);

const options = {
  churros: {
    updatePayload: contactsUpdatePayload
  }
};

suite.forElement('helpdesk', 'contacts', { payload: contactsCreatePayload }, (test) => {
  test.should.supportPagination();
  test.withOptions(options).should.supportCruds();
  test.should.supportCeqlSearchForMultipleRecords('name');
});
