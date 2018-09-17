'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

const adGroupCriterionPayload = tools.requirePayload(`${__dirname}/assets/ad-group-criterions.json`);
const globalAdGroupCriterionPayload = tools.requirePayload(`${__dirname}/assets/ad-group-criterions.json`);
const globalAdGroupPayload = tools.requirePayload(`${__dirname}/assets/ad-groups-create.json`);
const globalCampaignPayload = tools.requirePayload(`${__dirname}/assets/campaigns-create.json`);
const globalBudgetPayload = tools.requirePayload(`${__dirname}/assets/budgets-create.json`);


suite.forElement('general', 'ad-group-criterions', (test) => {
  let globalBudgetId, globalCampaignId, globalAdGroupId, globalAdGroupCriterionId;

  before(() => cloud.post(`/hubs/general/budgets`, globalBudgetPayload)
    .then(r => {
      globalBudgetId = r.body.id;
      globalCampaignPayload.budget.budgetId = globalBudgetId;
    })
    .then(() => cloud.post(`/hubs/general/campaigns`, globalCampaignPayload))
    .then(r => {
      globalCampaignId = r.body.id;
      globalAdGroupPayload.campaignId = globalCampaignId;
    })
    .then(() => cloud.post(`/hubs/general/ad-groups`, globalAdGroupPayload))
    .then(r => {
      globalAdGroupId = r.body.id;
      adGroupCriterionPayload.adGroupId = globalAdGroupId;
      globalAdGroupCriterionPayload.adGroupId = globalAdGroupId;
    })
    .then(() => cloud.post(`/hubs/general/ad-groups/${globalAdGroupId}/ad-group-criterions`, globalAdGroupCriterionPayload))
    .then(r => {
      globalAdGroupCriterionId = r.body.id;
    })
  );

  after(() => cloud.delete(`/hubs/general/ad-groups/${globalAdGroupId}/ad-group-criterions/${globalAdGroupCriterionId}`)
    .then(() => cloud.delete(`/hubs/general/ad-groups/${globalAdGroupId}`))
    .then(() => cloud.delete(`/hubs/general/campaigns/${globalCampaignId}`))
    .then(() => cloud.delete(`/hubs/general/budgets/${globalBudgetId}`)));


  it(`should allow GET with where CriteriaType= ${globalAdGroupCriterionPayload.criterion.type}`, () => {
    return cloud.withOptions({ qs: { where: `CriteriaType = '${globalAdGroupCriterionPayload.criterion.type}'` } }).get(`/hubs/general/ad-groups/${globalAdGroupId}/ad-group-criterions`)
      .then(r => expect(r.body.filter(obj => obj.criterion.type === `${globalAdGroupCriterionPayload.criterion.type}`)).to.not.be.empty);
  });

  it(`should allow CRDS for /hubs/general/ad-groups/${globalAdGroupId}/ad-group-criterions`, () => {
    return cloud.crds(`/hubs/general/ad-groups/${globalAdGroupId}/ad-group-criterions`, adGroupCriterionPayload);
  });

  it(`should allow pagination for adgroup-criterions`, () => {
    let adGroupCriterionId, page1, page2;
    return cloud.post(`/ad-groups/${globalAdGroupId}/ad-group-criterions`, adGroupCriterionPayload)
      .then(r => adGroupCriterionId = r.body.id)
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`/ad-groups/${globalAdGroupId}/ad-group-criterions`))
      .then(r => page1 = r.body)
      .then(r => cloud.withOptions({ qs: { page: 2, pageSize: 1 } }).get(`/ad-groups/${globalAdGroupId}/ad-group-criterions`))
      .then(r => page2 = r.body)
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 2 } }).get(`/ad-groups/${globalAdGroupId}/ad-group-criterions`))
      .then(r => expect(r.body).to.deep.equal(page1.concat(page2)))
      .then(r => cloud.delete(`/ad-groups/${globalAdGroupId}/ad-group-criterions/${adGroupCriterionId}`));
  });

});
