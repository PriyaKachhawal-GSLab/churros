'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const contactsPayload = tools.requirePayload(`${__dirname}/assets/contacts.json`);
const campaignsPayload = tools.requirePayload(`${__dirname}/assets/campaigns.json`);
const campaignsActivePayload = tools.requirePayload(`${__dirname}/assets/campaignsActive.json`);

suite.forElement('marketing', 'campaigns', { payload: campaignsPayload }, (test) => {
  it(`should allow CRUDS for ${test.api}, PATCH /campaigns/activate/:id and PATCH /campaigns/deactivate/:id`, () => {
    let campaignId;
    return cloud.post(test.api, campaignsPayload)
      .then(r => {
        campaignId = r.body.id;
      })
      .then(r => cloud.get(`${test.api}/${campaignId}`))
      .then(r => cloud.put(`${test.api}/${campaignId}`, campaignsPayload))
      .then(r => cloud.patch(`${test.api}/${campaignId}/activate`))
      .then(r => cloud.withOptions({ qs: { activeNow: true, runAsUserId : 11, scheduledFor : 'now' } }).patch(`${test.api}/${campaignId}/activate`))
      .then(r => cloud.patch(`${test.api}/${campaignId}/deactivate`))
      .then(r => cloud.get(test.api))
      .then(r => cloud.withOptions({ qs: { where: `id='${campaignId}'` } }).get(`${test.api}`))
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}`))
      .then(r => cloud.delete(`${test.api}/${campaignId}`));
  });

  it('should allow UD for /hubs/marketing/campaigns/:id/contacts', () => {
    let contactId, contactPostPayload, id = 18;
    return cloud.post(`/hubs/marketing/contacts`, contactsPayload)
      .then(r => contactId = r.body.id)
      .then(r => contactPostPayload = [{ "id": contactId }])
      .then(r => cloud.put(`${test.api}/${id}/contacts`, contactPostPayload))
      .then(r => cloud.delete(`${test.api}/${id}/contacts/${contactId}`))
      .then(r => cloud.delete(`/hubs/marketing/contacts/${contactId}`));
  });
});
