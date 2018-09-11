'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const projectsCreatePayload = tools.requirePayload(`${__dirname}/assets/projects-create.json`);
const projectsUpdatePayload = tools.requirePayload(`${__dirname}/assets/projects-update.json`);

const options = {
  churros: {
    updatePayload: projectsUpdatePayload
  }
};

suite.forElement('erp', 'projects', { payload : projectsCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});