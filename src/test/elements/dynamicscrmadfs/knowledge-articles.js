'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const knowledgeArticlesCreatePayload = tools.requirePayload(`${__dirname}/assets/knowledge-articles-create.json`);
const knowledgeArticlesUpdatePayload = tools.requirePayload(`${__dirname}/assets/knowledge-articles-update.json`);

const options = {
  churros: {
    updatePayload: knowledgeArticlesUpdatePayload
  }
};

suite.forElement('crm', 'knowledge-articles', { payload : knowledgeArticlesCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});