'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;
const payload = require('./assets/workspaces');

suite.forElement('general', 'workspaces', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.should.supportPagination();
  test.withOptions({ qs: { where: 'search=\'test\'' } })
    .withName('should support search by filter')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => JSON.stringify(obj).toLowerCase().indexOf('test'));
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
});
