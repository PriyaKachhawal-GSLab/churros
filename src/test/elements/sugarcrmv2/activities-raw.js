'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('crm', 'activities-raw', (test) => {
  let id;
  it(`should support GET, pagination and Ceql search for /hubs/crm/activities-raw`, () => {
    return cloud.get(test.api)
      .then(r => {
        id = r.body[0].id;
      })
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(test.api))
      .then(r => cloud.withOptions({ qs: { where: `id='${id}'` } }).get(test.api));
  });
});
