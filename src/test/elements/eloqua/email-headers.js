'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const emailHeadersCreatePayload =  tools.requirePayload(`${__dirname}/assets/emailHeaders-create.json`);
const emailHeadersUpdatePayload =  tools.requirePayload(`${__dirname}/assets/emailHeaders-update.json`);


suite.forElement('marketing', 'email-headers', { payload: emailHeadersCreatePayload }, (test) => {
  const opts = {
    churros: {
      updatePayload : emailHeadersUpdatePayload
    }
  };
  
  test.withOptions(opts).should.supportCruds();
  test.withOptions({ qs: { pageSize: 5 }}).should.supportPagination('id');
  test.should.supportCeqlSearchForMultipleRecords('name');
});
