'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const statesCreatePayload = tools.requirePayload(`${__dirname}/assets/states-create.json`);
const statesUpdatePayload = tools.requirePayload(`${__dirname}/assets/states-update.json`);

const options = {
  churros: {
    updatePayload: statesUpdatePayload
  }
};

suite.forElement('erp', 'states', { payload : statesCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
});