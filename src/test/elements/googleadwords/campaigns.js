'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');

const campaignPayloadCreate = tools.requirePayload(`${__dirname}/assets/campaigns-create.json`);
const campaignPayloadUpdate = tools.requirePayload(`${__dirname}/assets/campaigns-update.json`);
const globalBudgetPayload = tools.requirePayload(`${__dirname}/assets/budgets-create.json`);

suite.forElement('general', 'campaigns', { payload: campaignPayloadCreate }, (test) => {
  let globalBudgetId;

  before(() => cloud.post(`/hubs/general/budgets`, globalBudgetPayload)
    .then(r => {
      globalBudgetId = r.body.id;
      campaignPayloadCreate.budget.budgetId = globalBudgetId;
      campaignPayloadUpdate.budget.budgetId = globalBudgetId;
    }));

  after(() => cloud.delete(`/hubs/general/budgets/${globalBudgetId}`));

  const options = {
    churros: {
      updatePayload: campaignPayloadUpdate
    }
  };

  test.withOptions(options).should.supportCrds();
  test.should.supportPagination();
  test.should.supportCeqlSearch('id');
});
