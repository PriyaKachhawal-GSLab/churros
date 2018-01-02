'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('marketing', 'pages', null, (test) => {
  let pageId;
  test.should.supportSr();
  it('should allow SR for /hubs/marketing/pages', () => {
    return cloud.get(test.api)
      .then(r => pageId = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${pageId}`))
      .then(r => cloud.withOptions({ qs: { fields: 'id,name' } }).get(`${test.api}/${pageId}`));
  });

  it(`should allow CR for ${test.api}/${pageId}/subscribed-apps`, () => {
    let accessToken;
    return cloud.get(test.api)
      .then(r => accessToken = r.body[0].access_token)
      .then(r => cloud.withOptions({ qs: { access_token: accessToken } }).get(`${test.api}/${pageId}/subscribed-apps`))
      .then(r => cloud.withOptions({ qs: { access_token: accessToken } }).post(`${test.api}/${pageId}/subscribed-apps`));
  });
});
