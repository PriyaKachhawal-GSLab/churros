'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const contextCard = tools.requirePayload(`${__dirname}/assets/context-card.json`);
const thankYouCard = tools.requirePayload(`${__dirname}/assets/thank-you-card.json`);
const draftForm = tools.requirePayload(`${__dirname}/assets/draft-form.json`);
const form = tools.requirePayload(`${__dirname}/assets/form.json`);
const legalContent = tools.requirePayload(`${__dirname}/assets/legal-content.json`);

suite.forElement('marketing', 'pages', null, (test) => {
  let pageId;
  test.should.supportSr();
  it('should allow SR for /hubs/marketing/pages', () => {
    return cloud.get(test.api)
      .then(r => {
        if (r.body.length <= 0) {
          return;
        } else {
          pageId = pageId = r.body[0].id;
          return cloud.withOptions({ qs: { fields: 'id,name' } }).get(`${test.api}/${pageId}`);
        }
      });
  });

  it(`should allow CR for ${test.api}/${pageId}/subscribed-apps`, () => {
    let accessToken;
    return cloud.get(test.api)
      .then(r => accessToken = r.body[0].access_token)
      .then(r => cloud.withOptions({ qs: { access_token: accessToken } }).get(`${test.api}/${pageId}/subscribed-apps`))
      .then(r => cloud.withOptions({ qs: { access_token: accessToken } }).post(`${test.api}/${pageId}/subscribed-apps`));
  });

  it(`should allow CR for ${test.api}/${pageId}/context-cards`, () => {
    let accessToken;
    return cloud.get(test.api)
      .then(r => accessToken = r.body[0].access_token)
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 3 } }).get(`${test.api}/${pageId}/context-cards`))
      .then(r => cloud.withOptions({ qs: { access_token: accessToken } }).post(`${test.api}/${pageId}/context-cards`,contextCard));
  });

  it(`should allow C for ${test.api}/${pageId}/thank-you-card`, () => {
    let accessToken;
    return cloud.get(test.api)
      .then(r => accessToken = r.body[0].access_token)
      .then(r => cloud.withOptions({ qs: { access_token: accessToken } }).post(`${test.api}/${pageId}/thank-you-card`,thankYouCard));
  });

  it(`should allow CR for ${test.api}/${pageId}/draft-forms`, () => {
    let accessToken;
    return cloud.get(test.api)
      .then(r => accessToken = r.body[0].access_token)
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 3 } }).get(`${test.api}/${pageId}/draft-forms`))
      .then(r => cloud.withOptions({ qs: { access_token: accessToken } }).post(`${test.api}/${pageId}/draft-forms`,draftForm));
  });

  it(`should allow CR for ${test.api}/${pageId}/forms`, () => {
    let accessToken;
    return cloud.get(test.api)
      .then(r => accessToken = r.body[0].access_token)
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 3 } }).get(`${test.api}/${pageId}/forms`))
      .then(r => cloud.withOptions({ qs: { access_token: accessToken } }).post(`${test.api}/${pageId}/forms`,form));
  });

  it(`should allow CR for ${test.api}/${pageId}/legal-content`, () => {
    let accessToken;
    return cloud.get(test.api)
      .then(r => accessToken = r.body[0].access_token)
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 3 } }).get(`${test.api}/${pageId}/legal-content`))
      .then(r => cloud.withOptions({ qs: { access_token: accessToken } }).post(`${test.api}/${pageId}/legal-content`,legalContent));
  });
});
