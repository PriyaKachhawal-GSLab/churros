'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');

const contactsCreatePayload = tools.requirePayload(`${__dirname}/assets/contacts-create.json`);
const campaignsCreatePayload = tools.requirePayload(`${__dirname}/assets/campaigns-create.json`);
const campaignsUpdatePayload = tools.requirePayload(`${__dirname}/assets/campaigns-update.json`);
const campaignsActivatePayload = tools.requirePayload(`${__dirname}/assets/campaignsActivate-update.json`);

suite.forElement('marketing', 'campaigns', { payload: campaignsCreatePayload }, (test) => {
  it(`should allow CRUDS for ${test.api}, PATCH /campaigns/activate/:id and PATCH /campaigns/deactivate/:id`, () => {
    let campaignId;
    return cloud.post(test.api, campaignsCreatePayload)
      .then(r => {
        campaignId = r.body.id;
      })
      .then(r => cloud.get(`${test.api}/${campaignId}`))
      .then(r => cloud.put(`${test.api}/${campaignId}`, campaignsUpdatePayload))
      .then(r => cloud.patch(`${test.api}/${campaignId}/activate`, campaignsActivatePayload))
      .then(r => cloud.patch(`${test.api}/${campaignId}/deactivate`))
      .then(r => cloud.get(test.api))
      .then(r => cloud.withOptions({ qs: { where: `id='${campaignId}'` } }).get(`${test.api}`))
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}`))
      .then(r => cloud.delete(`${test.api}/${campaignId}`));
  });

  it('should allow UD for /hubs/marketing/campaigns/:id/contacts', () => {
    let contactId, contactPostPayload, id = 18;
    return cloud.post(`/hubs/marketing/contacts`, contactsCreatePayload)
      .then(r => contactId = r.body.id)
      .then(r => contactPostPayload = [{ "id": contactId }])
      .then(r => cloud.put(`${test.api}/${id}/contacts`, contactPostPayload))
      .then(r => cloud.delete(`${test.api}/${id}/contacts/${contactId}`))
      .then(r => cloud.delete(`/hubs/marketing/contacts/${contactId}`));
  });
});
