'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/folders-create.json`);
const updatePayload = tools.requirePayload(`${__dirname}/assets/folders-update.json`);
const options = {
  churros: {
    updatePayload: updatePayload
  }
};

suite.forElement('marketing', 'folders', { payload: payload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.should.supportPagination();
});
