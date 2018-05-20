'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const payload = require('./assets/contacts');
const cloud = require('core/cloud');
const tools = require('core/tools');

suite.forElement('helpdesk', 'contacts', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.should.supportPagination();

  it('should not allow malformed bulk query and throw a 400', () => {
    return cloud.withOptions({ qs: { q: 'select * contacts'} })
      .post('/hubs/helpdesk/bulk/query', null,
            r => { (expect(r).to.have.statusCode(400) && expect(r.body.message).to.include('Error parsing query')); });
  });

  it(`should allow escaped quote in where clause`, () => {
    let email = tools.randomEmail();
    let id, contactPayload = Object.assign(payload, { email: `z'${email}` });
    return cloud.post(test.api, contactPayload)
      .then(r => id = r.body.id)
      .then(r => cloud.withOptions({ qs: { where: `email='z''${email}'` } }).get(test.api))
      .then(r => expect(r.body).to.have.lengthOf(1))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
});
