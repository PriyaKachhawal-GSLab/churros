'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const pagination = require('./assets/activitiesRaw-queryPaginationTest.json');
const whereIdQuery = require('./assets/activitiesRaw-queryTypeTest.json');

suite.forElement('crm', 'activities-raw', (test) => {
    let id;
    it(`should support GET, pagination and Ceql search for /hubs/crm/activities-raw`, () => {
    return cloud.get(test.api)
      .then(r => {
        id = r.body[0].id;
        whereIdQuery.where = `id='${id}'`;
      })
      .then(r => cloud.withOptions({ qs: pagination }).get(test.api))
      .then(r => cloud.withOptions({ qs: { where: whereIdQuery } }).get(test.api));
  });
});
