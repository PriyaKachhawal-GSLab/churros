'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const customCollection = tools.requirePayload(`${__dirname}/assets/customCollections-create.json`);
const updatePayload = tools.requirePayload(`${__dirname}/assets/customCollections-update.json`);

suite.forElement('ecommerce', 'custom-collections', { payload: customCollection }, (test) => {
  const options = {
    churros: {
      updatePayload: updatePayload
    }
  };
  test.withOptions(options).should.supportCruds();
  test.withApi(`/hubs/ecommerce/custom-collections-count`).should.return200OnGet();
});
