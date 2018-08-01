const suite = require('core/suite');
const cloud = require('core/cloud');
const payload = require('./assets/workitem-fields.json');


suite.forElement('collaboration', 'work-items-fields', (test) => {
  it('should allow RS for work-items-fields', () => {
    test.should.supportSr();
    test.should.supportPagination();
  });
});