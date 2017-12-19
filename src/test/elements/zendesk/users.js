'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/users.json`);
const cloud = require('core/cloud');
const expect = require('chakram').expect;

const options = {
  churros: {
    updatePayload: {
      "username": "Userguy2",
      "email": tools.randomEmail()
    }
  }
};


suite.forElement('helpdesk', 'users', { payload }, (test) => {
  test.should.supportPagination();
  test.withOptions(options).should.supportCruds();
  it('should handle unicode', () => {
    return cloud.withOptions({qs:{where: "name='%F0%9F%92%A9'"}}).get('/users')
      .then(r => expect(r.body.length).to.equal(0));
  });
});
