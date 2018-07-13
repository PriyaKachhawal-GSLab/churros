const suite = require('core/suite');
const cloud = require('core/cloud');
const payload = require('./assets/workitem-fields.json');


suite.forElement('collaboration', 'workitem-fields', (test) => {
  it('should allow RS for workitem-fields', () => {
    var name = payload.name;
    return cloud.get(test.api)
    .then(r => cloud.get(`${test.api}/${name}`));
  });
});