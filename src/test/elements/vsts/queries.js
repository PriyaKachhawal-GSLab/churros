const suite = require('core/suite');
const queryUpdatePayload = require('./assets/queries-update.json');
const payload = require('./assets/queries-create.json');

suite.forElement('collaboration', 'queries', {payload}, (test) => {
  const updatePayload = {
    churros: {
      updatePayload: queryUpdatePayload
    }
  };
  test.withOptions(updatePayload).should.supportCruds();
  test.should.supportPagination();
});