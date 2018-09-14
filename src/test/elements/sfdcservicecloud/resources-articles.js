'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const articlesPayload = tools.requirePayload(`${__dirname}/assets/resourcesArticles-create.json`);
const updatePayload = tools.requirePayload(`${__dirname}/assets/resourcesArticles-update.json`);
const statusPayload = tools.requirePayload(`${__dirname}/assets/resourcesArticlesStatus-update.json`);
const cloud = require('core/cloud');

suite.forElement('helpdesk', 'resources/articles', { payload: articlesPayload }, (test) => {
  it('should allow CRUDS /hubs/helpdesk/resources/articles and CEQL search and pagination', () => {
    let articleId;
    return cloud.post('/hubs/helpdesk/resources/articles', articlesPayload)
      .then(r => articleId = r.body.Id)
      .then(r => cloud.get(`${test.api}/${articleId}`))
      .then(r => cloud.get(test.api))
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(test.api))
      .then(r => cloud.withOptions({ qs: { where: `id='${articleId}'` } }).get(test.api))
      .then(r => cloud.patch(`${test.api}/${articleId}`, updatePayload))
      .then(r => cloud.put(`${test.api}/${articleId}/status`, statusPayload))
      .then(r => cloud.delete(`${test.api}/${articleId}`));
  });
});
