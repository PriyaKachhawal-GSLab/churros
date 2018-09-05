'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const chakram = require('chakram');

const customObjectsCreatePayload = tools.requirePayload(`${__dirname}/assets/customObjects-create.json`);
const customObjectsUpdatePayload = tools.requirePayload(`${__dirname}/assets/customObjects-update.json`);

suite.forElement('marketing', 'custom-objects', { payload: customObjectsCreatePayload }, (test) => {
  const opts = {
    churros: {
      updatePayload : customObjectsUpdatePayload
    }
  };
  
  test.withOptions(opts).should.supportCruds(chakram.put);
  test.should.supportPagination();
  test.should.supportCeqlSearchForMultipleRecords('name');
});
