'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');

const contactPayload = {
  "person": {
    "lastName": tools.randomStr(),
    "firstName": tools.randomStr(),
    "email": tools.randomEmail()
  }
};

const listContactPayload = [{
  "person": {
    "id": tools.randomInt()
  }
}];

suite.forElement('helpdesk', 'lists', null, (test) => {
  it('should allow SR for /lists', () => {
    let id, contactId, objectName;
    return cloud.get(test.api)
      .then(r => id = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => cloud.get(`${test.api}/${id}/search`))
  });
});
