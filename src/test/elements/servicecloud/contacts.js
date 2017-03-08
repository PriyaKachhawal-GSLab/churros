'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');

suite.forElement('helpdesk', 'contacts', {skip: true}, (test) => {
  const updatePayload = {
    "login": tools.random()
  };

  it('should allow RUDS for contacts', () => {
    let contactID;
    return cloud.get(test.api)
      .then(r => contactID = r.body[0].id.id)
      .then(r => cloud.get(`${test.api}/${contactID}`))
      .then(r => cloud.patch(`${test.api}/${contactID}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${contactID}`))
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(test.api))
      .then(r => cloud.withOptions({ qs: { where: `login='Admin1'` } }).get(test.api));
  });
});