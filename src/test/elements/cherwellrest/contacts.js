'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const payload = require('./assets/contacts');
const cloud = require('core/cloud');

suite.forElement('helpdesk', 'contacts', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.should.supportPagination();

  it('should not allow malformed bulk query and throw a 400', () => {
    return cloud.withOptions({ qs: { q: 'select * contacts'} })
      .post('/hubs/helpdesk/bulk/query', null,
            r => { (expect(r).to.have.statusCode(400) && expect(r.body.message).to.include('Error parsing query')); });
  });
});