'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/lists-create.json`);
const updatePayload = tools.requirePayload(`${__dirname}/assets/lists-update.json`);
const options = {
  churros: {
    updatePayload: updatePayload
  }
};
suite.forElement('marketing', 'lists', { payload: payload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.should.supportPagination();
});
