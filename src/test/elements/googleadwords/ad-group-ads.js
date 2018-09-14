'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

const adPayload = tools.requirePayload(`${__dirname}/assets/ads-create.json`);
const globalAdPayload = tools.requirePayload(`${__dirname}/assets/ads-create.json`);
const adUpdatePayload = tools.requirePayload(`${__dirname}/assets/ads-update.json`);
const globalAdGroupPayload = tools.requirePayload(`${__dirname}/assets/ad-groups-create.json`);
const globalCampaignPayload = tools.requirePayload(`${__dirname}/assets/campaigns-create.json`);
const globalBudgetPayload = tools.requirePayload(`${__dirname}/assets/budgets-create.json`);


suite.forElement('general', 'ad-group-ads', (test) => {
  let globalBudgetId, globalCampaignId, globalAdGroupId, globalAdId;

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
      adPayload.adGroupId = globalAdGroupId;
      adUpdatePayload.adGroupId = globalAdGroupId;
      globalAdPayload.adGroupId = globalAdGroupId;
    })
    .then(() => cloud.post(`/hubs/general/ad-groups/${globalAdGroupId}/ads`, globalAdPayload))
    .then(r => globalAdId = r.body.id)
    //.then(() => cloud.patch(`/hubs/general/ads/${globalAdId}`, adUpdatePayload))
  );

  after(() => cloud.delete(`/hubs/general/ad-groups/${globalAdGroupId}/ads/${globalAdId}`)
    .then(() => cloud.delete(`/hubs/general/ad-groups/${globalAdGroupId}`))
    .then(() => cloud.delete(`/hubs/general/campaigns/${globalCampaignId}`))
    .then(() => cloud.delete(`/hubs/general/budgets/${globalBudgetId}`)));

  it(`should allow GET with where Id= ${globalAdId}`, () => {
    return cloud.withOptions({ qs: { where: `Id = '${globalAdId}'` } }).get(`/hubs/general/ad-groups/${globalAdGroupId}/ads`)
      .then(r => expect(r.body.filter(obj => obj.id === `${globalAdId}`)).to.not.be.empty);
  });

  it(`should allow CRDS for /hubs/general/ad-groups/${globalAdGroupId}/ads`, () => {
    return cloud.crds(`/hubs/general/ad-groups/${globalAdGroupId}/ads`, adPayload);
  });

  it(`should allow pagination for ads`, () => {
    let adId, page1, page2;
    return cloud.post(`/hubs/general/ad-groups/${globalAdGroupId}/ads`, adPayload)
      .then(r => adId = r.body.id)
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`/hubs/general/ad-groups/${globalAdGroupId}/ads`))
      .then(r => page1 = r.body)
      .then(r => cloud.withOptions({ qs: { page: 2, pageSize: 1 } }).get(`/hubs/general/ad-groups/${globalAdGroupId}/ads`))
      .then(r => page2 = r.body)
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 2 } }).get(`/hubs/general/ad-groups/${globalAdGroupId}/ads`))
      .then(r => expect(r.body).to.deep.equal(page1.concat(page2)))
      .then(r => cloud.delete(`/hubs/general/ad-groups/${globalAdGroupId}/ads/${adId}`));
  });
});
