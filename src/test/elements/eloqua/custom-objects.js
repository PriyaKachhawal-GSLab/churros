'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const chakram = require('chakram');

const customObjectsCreatePayload = tools.requirePayload(`${__dirname}/assets/custom-objects-create.json`);
const customObjectsUpdatePayload = tools.requirePayload(`${__dirname}/assets/custom-objects-update.json`);

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
