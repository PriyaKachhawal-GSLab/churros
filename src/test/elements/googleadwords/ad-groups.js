'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');

const adgroupCreatePayload = tools.requirePayload(`${__dirname}/assets/ad-groups-create.json`);
const adgroupUpdatePayload = tools.requirePayload(`${__dirname}/assets/ad-groups-update.json`);
const globalBudgetPayload = tools.requirePayload(`${__dirname}/assets/budgets-create.json`);
const globalCampaignPayload = tools.requirePayload(`${__dirname}/assets/campaigns-create.json`);

suite.forElement('general', 'ad-groups', { payload: adgroupCreatePayload }, (test) => {
  let globalBudgetId, globalCampaignId;

  before(() => cloud.post(`/hubs/general/budgets`, globalBudgetPayload)
    .then(r => {
      globalBudgetId = r.body.id;
      globalCampaignPayload.budget.budgetId = globalBudgetId;
    })
    .then(() => cloud.post(`/hubs/general/campaigns`, globalCampaignPayload))
    .then(r => {
      globalCampaignId = r.body.id;
      adgroupCreatePayload.campaignId = globalCampaignId;
      adgroupUpdatePayload.campaignId = globalCampaignId;
    }));

  after(() => cloud.delete(`/hubs/general/campaigns/${globalCampaignId}`)
    .then(() => cloud.delete(`/hubs/general/budgets/${globalBudgetId}`)));

  const options = {
    churros: {
      updatePayload: adgroupUpdatePayload
    }
  };

  test.withOptions(options).should.supportCruds();
  test.should.supportPagination();
  test.should.supportCeqlSearch('id');
});
