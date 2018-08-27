'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const expect = require('chakram').expect;

const labelPayload = tools.requirePayload(`${__dirname}/assets/labels.json`);
const globalLabelPayload = tools.requirePayload(`${__dirname}/assets/labels.json`);
const budgetPayload = tools.requirePayload(`${__dirname}/assets/budgets.json`);
const globalBudgetPayload = tools.requirePayload(`${__dirname}/assets/budgets.json`);
const campaignGroupPayload = tools.requirePayload(`${__dirname}/assets/campaign-groups.json`);
const globalCampaignGroupPayload = tools.requirePayload(`${__dirname}/assets/campaign-groups.json`);
const biddingStrategyPayload = tools.requirePayload(`${__dirname}/assets/bidding-strategies.json`);
const globalBiddingStrategyPayload = tools.requirePayload(`${__dirname}/assets/bidding-strategies.json`);
const campaignPayload = tools.requirePayload(`${__dirname}/assets/campaigns.json`);
const globalCampaignPayload = tools.requirePayload(`${__dirname}/assets/campaigns.json`);
const adgroupPayload = tools.requirePayload(`${__dirname}/assets/adgroups.json`);
const globalAdgroupPayload = tools.requirePayload(`${__dirname}/assets/adgroups.json`);
const adgroupAdsPayload = tools.requirePayload(`${__dirname}/assets/adgroups-ads.json`);
const globalAdgroupAdsPayload = tools.requirePayload(`${__dirname}/assets/adgroups-ads.json`);
const campaignCriterionPayload = tools.requirePayload(`${__dirname}/assets/campaign-criterions-en.json`);
const globalCampaignCriterionPayload = tools.requirePayload(`${__dirname}/assets/campaign-criterions.json`);
const adgroupCriterionPayload = tools.requirePayload(`${__dirname}/assets/adgroup-criterions.json`);
const globalAdgroupCriterionPayload = tools.requirePayload(`${__dirname}/assets/adgroup-criterions.json`);

suite.forElement('general', 'customers', (test) => {
  let globalLabelId, globalBudgetId, globalCampaignGroupId, globalBiddingStrategyId, globalCampaignId, globalAdGroupId, globalAdgroupAdId, globalCampaignCriterionId, globalAdgroupCriterionId;

  before(() => cloud.post(`/hubs/general/labels`, globalLabelPayload)
  .then(r => globalLabelId = r.body.id)
  .then(() => cloud.post(`/hubs/general/budgets`, globalBudgetPayload))
  .then(r => {
    globalBudgetId = r.body.id;
    campaignPayload.budget.budgetId = globalBudgetId;
    globalCampaignPayload.budget.budgetId = globalBudgetId;
  })
  .then(() => cloud.post(`/hubs/general/campaign-groups`, globalCampaignGroupPayload))
  .then(r => globalCampaignGroupId = r.body.id)
  .then(() => cloud.post(`/hubs/general/bidding-strategies`, globalBiddingStrategyPayload))
  .then(r => globalBiddingStrategyId = r.body.id)
  .then(() => cloud.post(`/hubs/general/campaigns`, globalCampaignPayload))
  .then(r => {
    globalCampaignId = r.body.id;
    adgroupPayload.campaignId = globalCampaignId;
    globalAdgroupPayload.campaignId = globalCampaignId;
    campaignCriterionPayload.campaignId = globalCampaignId;
    globalCampaignCriterionPayload.campaignId = globalCampaignId;
  })
  .then(() => cloud.post(`/hubs/general/adgroups`, globalAdgroupPayload))
  .then(r => {
    globalAdGroupId = r.body.id;
    adgroupAdsPayload.adGroupId = globalAdGroupId;
    globalAdgroupAdsPayload.adGroupId = globalAdGroupId;
    adgroupCriterionPayload.adGroupId = globalAdGroupId;
    globalAdgroupCriterionPayload.adGroupId = globalAdGroupId;
  })
  .then(() => cloud.post(`/hubs/general/adgroups/${globalAdGroupId}/ads`, globalAdgroupAdsPayload))
  .then(r => globalAdgroupAdId = r.body.id)
  .then(() => cloud.post(`/hubs/general/campaigns/${globalCampaignId}/campaign-criterions`, globalCampaignCriterionPayload))
  .then(r => globalCampaignCriterionId = r.body.criterion.id)
  .then(() => cloud.post(`/hubs/general/adgroups/${globalAdGroupId}/adgroup-criterions`, globalAdgroupCriterionPayload))
  .then(r => globalAdgroupCriterionId = r.body.criterion.id)
  );

  after(() => cloud.delete(`/hubs/general/labels/${globalLabelId}`)
  .then(() => cloud.delete(`/hubs/general/campaign-groups/${globalCampaignGroupId}`))
  .then(() => cloud.delete(`/hubs/general/bidding-strategies/${globalBiddingStrategyId}`))
  .then(() => cloud.delete(`/hubs/general/adgroups/${globalAdGroupId}/adgroup-criterions/${globalAdgroupCriterionId}`))
  .then(() => cloud.delete(`/hubs/general/campaigns/${globalCampaignId}/campaign-criterions/${globalCampaignCriterionId}`))
  .then(() => cloud.delete(`/hubs/general/adgroups/${globalAdGroupId}/ads/${globalAdgroupAdId}`))
  .then(() => cloud.delete(`/hubs/general/adgroups/${globalAdGroupId}`))
  .then(() => cloud.delete(`/hubs/general/campaigns/${globalCampaignId}`))
  .then(() => cloud.delete(`/hubs/general/budgets/${globalBudgetId}`))
  );

  test.should.supportPagination();

  it('should allow CRUDS for labels', () => {
    return cloud.crds(`/hubs/general/labels`, labelPayload);
  });

  it(`should allow GET for labels with LabelName = ${globalLabelPayload.name}`, () => {
    return cloud.withOptions({ qs: { where: `LabelName = '${globalLabelPayload.name}'` } }).get(`/hubs/general/labels`)
      .then(r => expect(r.body.filter(obj => obj.name === `${globalLabelPayload.name}`)).to.not.be.empty);
  });

  it('should allow CRUDS for budgets', () => {
    return cloud.crds(`/hubs/general/budgets`, budgetPayload);
  });

  it(`should allow GET for budgets with BudgetName = ${globalBudgetPayload.name}`, () => {
    return cloud.withOptions({ qs: { where: `BudgetName = '${globalBudgetPayload.name}'` } }).get(`/hubs/general/budgets`)
      .then(r => expect(r.body.filter(obj => obj.name === `${globalBudgetPayload.name}`)).to.not.be.empty);
  });

  it('should allow CRUDS for campaign-groups', () => {
    return cloud.crds(`/hubs/general/campaign-groups`, campaignGroupPayload);
  });

  it(`should allow GET for campaign-groups with Name = ${globalCampaignGroupPayload.name}`, () => {
    return cloud.withOptions({ qs: { where: `Name = '${globalCampaignGroupPayload.name}'` } }).get(`/hubs/general/campaign-groups`)
      .then(r => expect(r.body.filter(obj => obj.name === `${globalCampaignGroupPayload.name}`)).to.not.be.empty);
  });

  it('should allow CRUDS for bidding-strategies', () => {
    return cloud.crds(`/hubs/general/bidding-strategies`, biddingStrategyPayload);
  });

  it(`should allow GET for bidding-strategies with Name = ${globalBiddingStrategyPayload.name}`, () => {
    return cloud.withOptions({ qs: { where: `Name = '${globalBiddingStrategyPayload.name}'` } }).get(`/hubs/general/bidding-strategies`)
      .then(r => expect(r.body.filter(obj => obj.name === `${globalBiddingStrategyPayload.name}`)).to.not.be.empty);
  });

  it('should allow CRUDS for campaigns', () => {
    return cloud.crds(`/hubs/general/campaigns`, campaignPayload);
  });

  it(`should allow GET for campaigns with Name = ${globalCampaignPayload.name}`, () => {
    return cloud.withOptions({ qs: { where: `Name = '${globalCampaignPayload.name}'` } }).get(`/hubs/general/campaigns`)
      .then(r => expect(r.body.filter(obj => obj.name === `${globalCampaignPayload.name}`)).to.not.be.empty);
  });

  it('should allow CRUDS for adgroups', () => {
    return cloud.crds(`/hubs/general/adgroups`, adgroupPayload);
  });

  it(`should allow GET for adgroups with Name = ${globalAdgroupPayload.name}`, () => {
    return cloud.withOptions({ qs: { where: `Name = '${globalAdgroupPayload.name}'` } }).get(`/hubs/general/adgroups`)
      .then(r => expect(r.body.filter(obj => obj.name === `${globalAdgroupPayload.name}`)).to.not.be.empty);
  });

  it(`should allow CRDS for /adgroups/${globalAdgroupAdsPayload.adGroupId}/ads`, () => {
    return cloud.crds(`/hubs/general/adgroups/${globalAdGroupId}/ads`, adgroupAdsPayload);
  });

  it(`should allow GET for /adgroups/${globalAdgroupAdsPayload.adGroupId}/ads with Description = ${globalAdgroupAdsPayload.ad.description}`, () => {
    return cloud.withOptions({ qs: { where: `Description = '${globalAdgroupAdsPayload.ad.description}'` } }).get(`/hubs/general/adgroups/${globalAdGroupId}/ads`)
      .then(r => expect(r.body.filter(obj => obj.ad.description === `${globalAdgroupAdsPayload.ad.description}`)).to.not.be.empty);
  });

  it(`should allow CRD for /campaigns/${globalCampaignCriterionPayload.campaignId}/campaign-criterions`, () => {
    let localCampaignCriterionId;
    return cloud.post(`/hubs/general/campaigns/${globalCampaignId}/campaign-criterions`, campaignCriterionPayload)
    .then(r => localCampaignCriterionId = r.body.criterion.id)
    .then(() => cloud.get(`/hubs/general/campaigns/${globalCampaignId}/campaign-criterions/${localCampaignCriterionId}`))
    .then(() => cloud.delete(`/hubs/general/campaigns/${globalCampaignId}/campaign-criterions/${localCampaignCriterionId}`));
  });

  it(`should allow GET for /campaigns/${globalCampaignCriterionPayload.campaignId}/campaign-criterions with CriteriaType = ${globalCampaignCriterionPayload.criterion.type}`, () => {
    return cloud.withOptions({ qs: { where: `CriteriaType = '${globalCampaignCriterionPayload.criterion.type}'` } }).get(`/campaigns/${globalCampaignCriterionPayload.campaignId}/campaign-criterions`)
      .then(r => expect(r.body.filter(obj => obj.criterion.type === `${globalCampaignCriterionPayload.criterion.type}`)).to.not.be.empty);
  });

  it(`should allow CRD for /campaigns/${globalCampaignCriterionPayload.campaignId}/campaign-criterions`, () => {
    let localCampaignCriterionId;
    return cloud.post(`/hubs/general/campaigns/${globalCampaignId}/campaign-criterions`, campaignCriterionPayload)
    .then(r => localCampaignCriterionId = r.body.criterion.id)
    .then(() => cloud.get(`/hubs/general/campaigns/${globalCampaignId}/campaign-criterions/${localCampaignCriterionId}`))
    .then(() => cloud.delete(`/hubs/general/campaigns/${globalCampaignId}/campaign-criterions/${localCampaignCriterionId}`));
  });

  it(`should allow GET for /campaigns/${globalCampaignCriterionPayload.campaignId}/campaign-criterions with CriteriaType = ${globalCampaignCriterionPayload.criterion.type}`, () => {
    return cloud.withOptions({ qs: { where: `CriteriaType = '${globalCampaignCriterionPayload.criterion.type}'` } }).get(`/campaigns/${globalCampaignCriterionPayload.campaignId}/campaign-criterions`)
      .then(r => expect(r.body.filter(obj => obj.criterion.type === `${globalCampaignCriterionPayload.criterion.type}`)).to.not.be.empty);
  });

  it(`should allow CRD for /adgroups/${globalAdgroupCriterionPayload.adGroupId}/adgroup-criterions`, () => {
    let localadGroupCriterionId;
    return cloud.post(`/hubs/general/adgroups/${globalAdGroupId}/adgroup-criterions`, adgroupCriterionPayload)
    .then(r => localadGroupCriterionId = r.body.criterion.id)
    .then(() => cloud.get(`/hubs/general/adgroups/${globalAdGroupId}/adgroup-criterions/${localadGroupCriterionId}`))
    .then(() => cloud.delete(`/hubs/general/adgroups/${globalAdGroupId}/adgroup-criterions/${localadGroupCriterionId}`));
  });

  it(`should allow GET for /adgroups/${globalAdgroupCriterionPayload.adGroupId}/adgroup-criterions with CriteriaType = ${globalAdgroupCriterionPayload.criterion.type}`, () => {
    return cloud.withOptions({ qs: { where: `CriteriaType = '${globalAdgroupCriterionPayload.criterion.type}'` } }).get(`/adgroups/${globalAdgroupCriterionPayload.adGroupId}/adgroup-criterions`)
      .then(r => expect(r.body.filter(obj => obj.criterion.type === `${globalAdgroupCriterionPayload.criterion.type}`)).to.not.be.empty);
  });

});
