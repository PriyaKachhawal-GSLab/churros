'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const classesCreatePayload = tools.requirePayload(`${__dirname}/assets/classes-create.json`);
const classesUpdatePayload = tools.requirePayload(`${__dirname}/assets/classes-update.json`);

const options = {
  churros: {
    updatePayload: classesUpdatePayload
  }
};

suite.forElement('finance', 'classes', { payload: classesCreatePayload }, (test) => {
  test.should.supportPagination();
  test.withOptions(options).should.supportCruds();
  test.should.supportCeqlSearchForMultipleRecords('name');
});
