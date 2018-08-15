'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const expect = require('chakram').expect;

const globalBudgetPayload = tools.requirePayload(`${__dirname}/assets/budgets.json`);
const globalCampaignPayload = tools.requirePayload(`${__dirname}/assets/campaigns.json`);
const globalAdGroupPayload = tools.requirePayload(`${__dirname}/assets/ad-groups.json`);
const globalLabelPayload = tools.requirePayload(`${__dirname}/assets/labels.json`);
const globalCampaignGroupPayload = tools.requirePayload(`${__dirname}/assets/campaign-groups.json`);
const globalAdGroupAdPayload = tools.requirePayload(`${__dirname}/assets/ad-group-ads.json`);
const labelPayload = tools.requirePayload(`${__dirname}/assets/labels.json`);
const budgetPayload = tools.requirePayload(`${__dirname}/assets/budgets.json`);
const campaignGroupPayload = tools.requirePayload(`${__dirname}/assets/campaign-groups.json`);
const campaignPayload = tools.requirePayload(`${__dirname}/assets/campaigns.json`);
const adGroupPayload = tools.requirePayload(`${__dirname}/assets/ad-groups.json`);
const adGroupAdPayload = tools.requirePayload(`${__dirname}/assets/ad-group-ads.json`);



/**
 * For Google Adwords The Client Customer Account has to be Approved by Google. Then only we are able to do operations on Campaigns, Labels, AdGroups etc.,.
 * To build this element i created a test account under which i tested all depedent services which is not approved by goolge. 
 * This test account details are not available through /customers API. So that i hardcoded this value as customerId = 4087110117
 */
suite.forElement('general', 'customers', (test) => {
  let customerId = 4087110117, customersId, labelId, budgetId, globalBudgetId, globalCampaignId, globalAdGroupId, globalLabelId, globalCampaignGroupId, globalAdGroupAdId, campaignGroupId, campaignId, adGroupId, adId, adGroupAdId;

  before(() => cloud.get(test.api)
    .then(r => customersId = r.body[0].customerId)
    .then(r => cloud.post(`${test.api}/${customerId}/budgets`, globalBudgetPayload))
    .then(r => {
      globalBudgetId = r.body.id;
      globalCampaignPayload.budget.budgetId = globalBudgetId;
    })
    .then(r => cloud.post(`${test.api}/${customerId}/campaigns`, globalCampaignPayload))
    .then(r => {
      globalCampaignId = r.body.id
      globalAdGroupPayload.campaignId = globalCampaignId;
    })
    .then(r => cloud.get(`${test.api}/${customerId}/ads`))
    .then(r => adId = r.body[0].id)
    .then(r => cloud.post(`${test.api}/${customerId}/ad-groups`, globalAdGroupPayload))
    .then(r => {
      globalAdGroupId = r.body.id;
      globalAdGroupAdPayload.ad.id = adId;
      globalAdGroupAdPayload.adGroupId = globalAdGroupId
    })
    .then(r => cloud.post(`${test.api}/${customerId}/labels`, globalLabelPayload))
    .then(r => globalLabelId = r.body.id)
    .then(r => cloud.post(`${test.api}/${customerId}/campaign-groups`, globalCampaignGroupPayload))
    .then(r => globalCampaignGroupId = r.body.id)
    .then(r => cloud.post(`${test.api}/${customerId}/ad-group-ads`, globalAdGroupAdPayload))
    .then(r => globalAdGroupAdId = r.body.id)
  );

  after(() => cloud.delete(`${test.api}/${customerId}/campaign-groups/${globalCampaignGroupId}`)
    .then(() => cloud.delete(`${test.api}/${customerId}/labels/${globalLabelId}`))
    .then(() => cloud.delete(`${test.api}/${customerId}/ad-groups/${globalAdGroupId}`))
    .then(() => cloud.delete(`${test.api}/${customerId}/campaigns/${globalCampaignId}`))
    .then(() => cloud.delete(`${test.api}/${customerId}/budgets/${globalBudgetId}`))
  );

  test.should.supportPagination();

  it('should allow CRUDS for /customers/{customerId}/labels', () => {
    return cloud.cruds(`${test.api}/${customerId}/labels`, labelPayload);
  });


  it(`should allow GET for /customers/${customerId}/labels with LabelName = ${globalLabelPayload.name}`, () => {
    return cloud.withOptions({ qs: { where: `LabelName = '${globalLabelPayload.name}'` } }).get(`${test.api}/${customerId}/labels`)
      .then(r => expect(r.body.filter(obj => obj.name == `${globalLabelPayload.name}`)).to.not.be.empty);
  });

  it('should allow CRUDS for /customers/{customerId}/budgets', () => {
    return cloud.cruds(`${test.api}/${customerId}/budgets`, budgetPayload);
  });

  it(`should allow GET for /customers/${customerId}/budgets with BudgetName = ${globalBudgetPayload.name}`, () => {
    return cloud.withOptions({ qs: { where: `BudgetName = '${globalBudgetPayload.name}'` } }).get(`${test.api}/${customerId}/budgets`)
      .then(r => expect(r.body.filter(obj => obj.name == `${globalBudgetPayload.name}`)).to.not.be.empty);
  });

  it('should allow CRUDS for /customers/{customerId}/campaign-groups', () => {
    return cloud.cruds(`${test.api}/${customerId}/campaign-groups`, campaignGroupPayload);
  });

  it(`should allow GET for /customers/${customerId}/campaign-groups with Name = ${globalCampaignGroupPayload.name}`, () => {
    return cloud.withOptions({ qs: { where: `Name = '${globalCampaignGroupPayload.name}'` } }).get(`${test.api}/${customerId}/campaign-groups`)
      .then(r => expect(r.body.filter(obj => obj.name == `${globalCampaignGroupPayload.name}`)).to.not.be.empty);
  });

  it('should allow CRUDS for /customers/{customerId}/campaigns', () => {
    campaignPayload.budget.budgetId = globalBudgetId;
    return cloud.cruds(`${test.api}/${customerId}/campaigns`, campaignPayload);
  });

  it(`should allow GET for /customers/${customerId}/campaigns with Name = ${globalCampaignPayload.name}`, () => {
    return cloud.withOptions({ qs: { where: `Name = '${globalCampaignPayload.name}'` } }).get(`${test.api}/${customerId}/campaigns`)
      .then(r => expect(r.body.filter(obj => obj.name == `${globalCampaignPayload.name}`)).to.not.be.empty);
  });

  it('should allow CRUDS for /customers/{customerId}/ad-groups', () => {
    adGroupPayload.campaignId = globalCampaignId;
    return cloud.cruds(`${test.api}/${customerId}/ad-groups`, adGroupPayload);
  });

  it(`should allow GET for /customers/${customerId}/ad-groups with Name = ${globalAdGroupPayload.name}`, () => {
    return cloud.withOptions({ qs: { where: `Name = '${globalAdGroupPayload.name}'` } }).get(`${test.api}/${customerId}/ad-groups`)
      .then(r => expect(r.body.filter(obj => obj.name == `${globalAdGroupPayload.name}`)).to.not.be.empty);
  });

  it('should allow CRUS for /customers/{customerId}/ad-group-ads', () => {
    return  cloud.post(`${test.api}/${customerId}/ad-groups`, adGroupPayload)
    .then(r => {
      adGroupAdPayload.ad.id = adId;
      adGroupAdPayload.adGroupId = r.body.id;
    })
    .then(() => cloud.crus(`${test.api}/${customerId}/ad-group-ads`, adGroupAdPayload))
    .then(r => cloud.delete(`${test.api}/${customerId}/ad-groups/${adGroupAdPayload.adGroupId}`));
  });

  it(`should allow GET for /customers/${customerId}/ad-group-ads with BaseAdGroupId = ${globalAdGroupAdPayload.adGroupId}`, () => {
    return cloud.withOptions({ qs: { where: `BaseAdGroupId = '${globalAdGroupAdPayload.adGroupId}'` } }).get(`${test.api}/${customerId}/ad-group-ads`)
      .then(r => expect(r.body.filter(obj => obj.id == `${globalAdGroupAdPayload.adGroupId}`)).to.not.be.empty);
  });

});
