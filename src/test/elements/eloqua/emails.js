'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const emailsCreatePayload = tools.requirePayload(`${__dirname}/assets/emails-create.json`);
const emailsUpdatePayload = tools.requirePayload(`${__dirname}/assets/emails-update.json`);


suite.forElement('marketing', 'emails', { payload: emailsCreatePayload }, (test) => {
  const opts = {
    churros: {
      updatePayload : emailsUpdatePayload
    }
  };
  test.withOptions(opts).should.supportCruds();
  test.should.supportPagination();
  test.should.supportCeqlSearchForMultipleRecords('name');
});
