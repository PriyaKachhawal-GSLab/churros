'use strict';

const suite = require('core/suite');
const payload = require('./assets/contacts');
const tools = require('core/tools');
const cloud = require('core/cloud');
const build = (overrides) => Object.assign({}, payload, overrides);
const contactsPayload = build({ contactKey: tools.randomEmail() });

const updatedPayload = {
  "contactKey": tools.randomEmail(),
  "attributeSets": [{
    "name": "Email Addresses",
    "items": [{
      "values": [{
          "name": "Email Address",
          "value": tools.randomEmail()
        },
        {
          "name": "HTML Enabled",
          "value": true
        }
      ]
    }]
  }]
};

suite.forElement('marketing', 'contacts', { payload: contactsPayload }, (test) => {
  it('should allow CUS for /contacts', () => {
    let id;
    return cloud.post(test.api, contactsPayload)
      .then(r => id = r.body.id)
      .then(r => cloud.patch(`${test.api}/${id}`, updatedPayload))
      .then(r => cloud.get(test.api), { qs: { key: 'Email Addresses', value: '${tools.randomStr()}' } });
  });
  test.should.supportPagination();
});
