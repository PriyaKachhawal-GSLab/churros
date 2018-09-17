'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const requisitionsCreatePayload = tools.requirePayload(`${__dirname}/assets/requisitions-create.json`);
const requisitionsUpdatePayload = tools.requirePayload(`${__dirname}/assets/requisitions-update.json`);

const options = {
  churros: {
    updatePayload: requisitionsUpdatePayload
  }
};

suite.forElement('humancapital', 'requisitions', { payload: requisitionsCreatePayload }, (test) => {
  test.should.supportPagination();
  test.withOptions(options).should.supportCruds();
  test.should.supportCeqlSearch('id');
});
