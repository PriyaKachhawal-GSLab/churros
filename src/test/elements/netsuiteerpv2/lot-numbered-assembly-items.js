'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const lotNumberedAssemblyItemsCreatePayload = tools.requirePayload(`${__dirname}/assets/lot-numbered-assembly-items-create.json`);
const lotNumberedAssemblyItemsUpdatePayload = tools.requirePayload(`${__dirname}/assets/lot-numbered-assembly-items-update.json`);

const options = {
  churros: {
    updatePayload: lotNumberedAssemblyItemsUpdatePayload
  }
};

suite.forElement('erp', 'lot-numbered-assembly-items', { payload : lotNumberedAssemblyItemsCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});