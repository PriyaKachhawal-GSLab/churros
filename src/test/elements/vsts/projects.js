const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('collaboration', 'projects', (test) => {
  it('should allow RR for projects & properties', () => {
    return cloud.get(test.api)
    .then(r => cloud.get(`/properties`)); 
  });
});
