'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/workflows-create.json`);
const updatePayload = tools.requirePayload(`${__dirname}/assets/workflows-update.json`);


suite.forElement('marketing', 'workflows', { payload: payload }, (test) => {
  const options = {
    churros: {
      updatePayload: updatePayload
    }
  };
  test.withOptions(options).should.supportCrds();
  test.should.supportNextPagePagination(2);
});
