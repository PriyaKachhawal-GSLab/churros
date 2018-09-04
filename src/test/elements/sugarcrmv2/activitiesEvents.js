'use strict';

const suite = require('core/suite');
const payload = require('./assets/activitiesEvents-create.json');
const updatePayload = require('./assets/activitiesEvents-update.json');


suite.forElement('crm', 'activitiesEvents', { payload: payload }, (test) => {
  const options = {
    churros: {
      updatePayload: updatePayload
    }
  };
  test.should.supportCruds();
  test.should.supportPagination();
});
