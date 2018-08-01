'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const payload = require('./assets/field');

suite.forElement('helpdesk', 'fields', {skip: true, payload:payload}, (test) => {
  it('should allow create and get of fields', () => {
    return cloud.post("/hubs/helpdesk/fields", payload)
    .then(cloud.get("/hubs/helpdesk/fields"))
    .then(r => cloud.withOptions({qs:{page: 1, pageSize: 1 }}).get('/hubs/helpdesk/fields'));
  });
});
