'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const emailHeadersCreatePayload =  tools.requirePayload(`${__dirname}/assets/email-headers-create.json`);
const emailHeadersUpdatePayload =  tools.requirePayload(`${__dirname}/assets/email-headers-update.json`);


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
