'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('marketing', 'channels', null, (test) => {
  let channelId;
  it(`should support GET, pagination and Ceql search for ${test.api}`, () => {
    return cloud.get(test.api)
      .then(r => channelId = r.body[0].id)
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(test.api))
      .then(r => cloud.withOptions({ qs: { where: `id='${channelId}'` } }).get(test.api));
  });

  it(`should support GET, pagination and Ceql search for ${test.api}/:channelId/activities`, () => {
    return cloud.get(`${test.api}/${channelId}/activities`)
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${channelId}/activities`))
  });

  it('should support GET, pagination and Ceql search for /hubs/marketing/channels/:channelId/contacts', () => {
    
    return cloud.get(`${test.api}/${channelId}/contacts`)     
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${channelId}/contacts`))
      
  });

  it(`should support GET, pagination and Ceql search for ${test.api}/:channelId/subscriberWebcastAttachmentAccessSummaries`, () => {
    
    return cloud.get(`${test.api}/${channelId}/subscriberWebcastAttachmentAccessSummaries`)
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${channelId}/subscriberWebcastAttachmentAccessSummaries`))
      
  });

  it(`should support GET, pagination and Ceql search for ${test.api}/:channelId/surveys  and /hubs/marketing/surveys/:surveyId/responses`, () => {
    
    return cloud.get(`${test.api}/${channelId}/surveys`)
      
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${channelId}/surveys`))
      .then(r => cloud.withOptions({ qs: { where: `id='${surveyId}'` } }).get(`${test.api}/${channelId}/surveys`))
      .then(r => cloud.get(`/hubs/marketing/surveys/${surveyId}/responses`))
      .then(r => id = r.body[0].id)
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`/hubs/marketing/surveys/${surveyId}/responses`))
      .then(r => cloud.withOptions({ qs: { where: `id='${id}'` } }).get(`/hubs/marketing/surveys/${surveyId}/responses`));
  });
});