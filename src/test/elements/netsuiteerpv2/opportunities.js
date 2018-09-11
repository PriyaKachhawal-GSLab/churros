'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const opportunitiesCreatePayload = tools.requirePayload(`${__dirname}/assets/opportunities-create.json`);
const opportunitiesUpdatePayload = tools.requirePayload(`${__dirname}/assets/opportunities-update.json`);

const options = {
  churros: {
    updatePayload: opportunitiesUpdatePayload
  }
};

suite.forElement('erp', 'opportunities', { payload : opportunitiesCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.should.supportCeqlSearch('id');
});