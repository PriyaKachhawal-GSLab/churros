'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');

const categoriesCreatePayload = tools.requirePayload(`${__dirname}/assets/categories-create.json`);
const categoriesUpdatePayload = tools.requirePayload(`${__dirname}/assets/categories-create.json`);
const sectionsCreatePayload = tools.requirePayload(`${__dirname}/assets/sections-create.json`);
const sectionsUpdatePayload = tools.requirePayload(`${__dirname}/assets/sections-update.json`);
const incidentsCreatePayload = tools.requirePayload(`${__dirname}/assets/incidents-create.json`);
const articlesUpdatePayload = tools.requirePayload(`${__dirname}/assets/articles-update.json`);
const articlesCreatePayload = tools.requirePayload(`${__dirname}/assets/articles-create.json`);

const optionsCategories = {
  churros: {
    updatePayload: categoriesUpdatePayload
  }
};

suite.forElement('helpdesk', 'resources', { payload: incidentsCreatePayload }, (test) => {
  test.withApi(`${test.api}/categories`).should.supportPagination();

  test.withApi(`${test.api}/categories`).withOptions(optionsCategories).withJson(categoriesCreatePayload).should.supportCruds();

  it('should support CRUDS for /hubs/helpdesk/resources/categories/:id/sections', () => {
    let categoryId, sectionId;
    return cloud.post(`${test.api}/categories`, categoriesCreatePayload)
      .then(r => categoryId = r.body.id)
      .then(r => cloud.post(`${test.api}/categories/${categoryId}/sections`, sectionsCreatePayload))
      .then(r => sectionId = r.body.id)
      .then(r => cloud.get(`/hubs/helpdesk/resources/sections`))
      .then(r => cloud.get(`/hubs/helpdesk/resources/sections/${sectionId}`))
      .then(r => cloud.patch(`/hubs/helpdesk/resources/sections/${sectionId}`, sectionsUpdatePayload))
      .then(r => cloud.delete(`/hubs/helpdesk/resources/sections/${sectionId}`))
      .then(r => cloud.delete(`${test.api}/categories/${categoryId}`));
  });

  it('should support RS for /hubs/helpdesk/resources/articles and CEQL search', () => {
    let articleId;
    return cloud.withOptions({ qs: { where: `title='abc'` } }).get(`${test.api}/articles`)
      .then(r => articleId = r.body[0].id)
      .then(r => cloud.get(`${test.api}/articles/${articleId}`));
  });

  it('should support CRUDS for /hubs/helpdesk/resources/sections/:id/articles', () => {
    let categoryId, articleId, sectionId;
    return cloud.post(`${test.api}/categories`, categoriesCreatePayload)
      .then(r => categoryId = r.body.id)
      .then(r => cloud.post(`${test.api}/categories/${categoryId}/sections`, sectionsCreatePayload))
      .then(r => sectionId = r.body.id)
      .then(r => cloud.post(`${test.api}/sections/${sectionId}/articles`, articlesCreatePayload))
      .then(r => articleId = r.body.id)
      .then(r => cloud.get(`/hubs/helpdesk/resources/articles/${articleId}`))
      .then(r => cloud.patch(`/hubs/helpdesk/resources/articles/${articleId}`, articlesUpdatePayload))
      .then(r => cloud.delete(`/hubs/helpdesk/resources/articles/${articleId}`))
      .then(r => cloud.delete(`/hubs/helpdesk/resources/sections/${sectionId}`))
      .then(r => cloud.delete(`${test.api}/categories/${categoryId}`));
  });
});
