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

suite.forElement('finance', 'projects', { payload: projectsCreatePayload }, (test) => {
  test.should.supportPagination();
  test.withOptions(options).should.supportCruds();
  test.should.supportCeqlSearchForMultipleRecords('name');
});
