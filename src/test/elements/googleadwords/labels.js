'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const labelPayloadCreate = tools.requirePayload(`${__dirname}/assets/labels-create.json`);
const labelPayloadUpdate = tools.requirePayload(`${__dirname}/assets/labels-update.json`);

suite.forElement('general', 'labels', { payload: labelPayloadCreate }, (test) => {
  const options = {
    churros: {
      updatePayload: labelPayloadUpdate
    }
  };

  test.withOptions(options).should.supportCruds();
  test.should.supportPagination();
  test.should.supportCeqlSearch('id');
});
