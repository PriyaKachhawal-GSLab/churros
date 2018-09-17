'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

const usersCreatePayload = tools.requirePayload(`${__dirname}/assets/users-create.json`);
const usersUpdatePayload = tools.requirePayload(`${__dirname}/assets/users-update.json`);

const options = {
  churros: {
    updatePayload: usersUpdatePayload
  }
};


suite.forElement('helpdesk', 'users', { payload : usersCreatePayload }, (test) => {
  test.should.supportPagination();
  test.withOptions(options).should.supportCruds();
  test.should.supportCeqlSearch('id');
  it('should handle unicode', () => {
    return cloud.withOptions({ qs: { where: "name='%F0%9F%92%A9'" } }).get('/users')
      .then(r => expect(r.body.length).to.equal(0));
  });
});
