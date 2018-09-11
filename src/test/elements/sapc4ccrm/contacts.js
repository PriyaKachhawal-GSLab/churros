'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const contactsCreatePayload = tools.requirePayload(`${__dirname}/assets/contacts-create.json`);
const contactsUpdatePayload = tools.requirePayload(`${__dirname}/assets/contacts-update.json`);

const options = {
  churros: {
    updatePayload: contactsUpdatePayload
  }
};

suite.forElement('crm', 'contacts', { payload : contactsCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});