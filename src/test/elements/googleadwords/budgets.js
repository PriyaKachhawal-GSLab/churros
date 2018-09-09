'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const budgetCreatePayload = tools.requirePayload(`${__dirname}/assets/budgets-create.json`);
const budgetUpdatePayload = tools.requirePayload(`${__dirname}/assets/budgets-update.json`);


suite.forElement('general', 'budgets', { payload: budgetCreatePayload }, (test) => {
  const options = {
    churros: {
      updatePayload: budgetUpdatePayload
    }
  };

  test.withOptions(options).should.supportCruds();
  test.should.supportPagination();
  test.should.supportCeqlSearch('id');
});
