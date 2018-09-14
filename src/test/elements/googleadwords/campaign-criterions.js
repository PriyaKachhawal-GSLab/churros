'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

const campaignCriterionPayload = tools.requirePayload(`${__dirname}/assets/campaign-criterions-createone.json`);
const globalCampaignCriterionPayload = tools.requirePayload(`${__dirname}/assets/campaign-criterions-createtwo.json`);
const globalCampaignPayload = tools.requirePayload(`${__dirname}/assets/campaigns-create.json`);
const globalBudgetPayload = tools.requirePayload(`${__dirname}/assets/budgets-create.json`);


suite.forElement('general', 'campaign-criterions', (test) => {
  let globalBudgetId, globalCampaignId, globalCampaignCriterionId;

  before(() => cloud.post(`/hubs/general/budgets`, globalBudgetPayload)
    .then(r => {
      globalBudgetId = r.body.id;
      globalCampaignPayload.budget.budgetId = globalBudgetId;
    })
    .then(() => cloud.post(`/hubs/general/campaigns`, globalCampaignPayload))
    .then(r => {
      globalCampaignId = r.body.id;
      campaignCriterionPayload.campaignId = globalCampaignId;
      globalCampaignCriterionPayload.campaignId = globalCampaignId;
    })
    .then(() => cloud.post(`/hubs/general/campaigns/${globalCampaignId}/campaign-criterions`, globalCampaignCriterionPayload))
    .then(r => globalCampaignCriterionId = r.body.id)
  );

  after(() => cloud.delete(`/hubs/general/campaigns/${globalCampaignId}/campaign-criterions/${globalCampaignCriterionId}`)
    .then(() => cloud.delete(`/hubs/general/campaigns/${globalCampaignId}`))
    .then(() => cloud.delete(`/hubs/general/budgets/${globalBudgetId}`)));

  it(`should allow GET with where CriteriaType= ${globalCampaignCriterionPayload.criterion.type}`, () => {
    return cloud.withOptions({ qs: { where: `CriteriaType = '${globalCampaignCriterionPayload.criterion.type}'` } }).get(`/campaigns/${globalCampaignCriterionPayload.campaignId}/campaign-criterions`)
      .then(r => expect(r.body.filter(obj => obj.criterion.type === `${globalCampaignCriterionPayload.criterion.type}`)).to.not.be.empty);
  });

  it(`should allow CRDS for campaign-criterions`, () => {
    return cloud.crds(`/campaigns/${globalCampaignId}/campaign-criterions`, campaignCriterionPayload);
  });

  it(`should allow pagination for campaign-criterions`, () => {
    let campaignCriterionId, page1, page2;
    return cloud.post(`/campaigns/${globalCampaignId}/campaign-criterions`, campaignCriterionPayload)
      .then(r => campaignCriterionId = r.body.id)
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`/campaigns/${globalCampaignId}/campaign-criterions`))
      .then(r => page1 = r.body)
      .then(r => cloud.withOptions({ qs: { page: 2, pageSize: 1 } }).get(`/campaigns/${globalCampaignId}/campaign-criterions`))
      .then(r => page2 = r.body)
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 2 } }).get(`/campaigns/${globalCampaignId}/campaign-criterions`))
      .then(r => expect(r.body).to.deep.equal(page1.concat(page2)))
      .then(r => cloud.delete(`/campaigns/${globalCampaignId}/campaign-criterions/${campaignCriterionId}`));
  });
});
