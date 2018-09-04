'use strict';

const suite = require('core/suite');
const payload = require('core/tools').requirePayload(`${__dirname}/assets/users-create.json`);
const updatePayload = require('core/tools').requirePayload(`${__dirname}/assets/users-update.json`);


suite.forElement('crm', 'users', { payload: payload }, (test) => {
  const options = {
    churros: {
      updatePayload: updatePayload
    }
  };
  test.withOptions(options).should.supportCruds();
  test.should.supportPagination();
});
