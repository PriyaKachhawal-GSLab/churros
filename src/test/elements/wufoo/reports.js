'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('general', 'reports', (test) => {
  test.should.return200OnGet();
  it(`should allow GET for /hubs/general/reports/{id}`, () => {
    return cloud.get(`${test.api}`)
      .then(r => cloud.get(`${test.api}/${r.body[0].id}`));
  });
  it(`should allow GET and Pagination for /hubs/general/report/{id}/entries`, () => {
    let reportId;
    return cloud.get(`${test.api}`)
      .then(r => reportId = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${reportId}/entries`))
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${reportId}/entries`));
  });
  it(`should allow GET for /hubs/general/reports/{id}/entries-count`, () => {
    return cloud.get(`${test.api}`)
      .then(r => cloud.get(`${test.api}/${r.body[0].id}/entries-count`));
  });
  it(`should allow GET and Pagination for /hubs/general/reports/{id}/fields`, () => {
    let reportId;
    return cloud.get(`${test.api}`)
	  .then(r => reportId = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${reportId}/fields`))
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${reportId}/fields`));
  });
  it(`should allow GET for /hubs/general/reports/{id}/widgets`, () => {
    return cloud.get(`${test.api}`)
      .then(r => cloud.get(`${test.api}/${r.body[0].id}/widgets`));
  });
  test.should.supportPagination('id');
});
