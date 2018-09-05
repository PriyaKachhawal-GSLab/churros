'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const emailFootersCreatePayload =  tools.requirePayload(`${__dirname}/assets/emailFooters-create.json`);
const emailFootersUpdatePayload =  tools.requirePayload(`${__dirname}/assets/emailFooters-update.json`);

suite.forElement('marketing', 'email-footers', { payload: emailFootersCreatePayload }, (test) => {
  const opts = {
    churros: {
      updatePayload : emailFootersUpdatePayload
    }
  };

  test.withOptions(opts).should.supportCruds();
  test.should.supportPagination();
  test.should.supportCeqlSearchForMultipleRecords('name');
});
