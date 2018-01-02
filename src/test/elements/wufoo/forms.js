'use strict';

const suite = require('core/suite');
const payload = require('./assets/forms');
const cloud = require('core/cloud');

suite.forElement('general', 'forms', { payload: payload }, (test) => {
  test.should.return200OnGet();
  it(`should allow GET for /hubs/general/forms/{id}`, () => {
    return cloud.get(`${test.api}`)
      .then(r => cloud.get(`${test.api}/${r.body[0].id}`));
  });
  it(`should allow GET, Pagination and CEQL search for /hubs/general/forms/{id}/comments`, () => {
    let formId;
    return cloud.get(`${test.api}`)
      .then(r => formId = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${formId}/comments`))
      .then(r => cloud.withOptions({ qs: { where: `entryId=${r.body[0].EntryId}` } }).get(`${test.api}/${formId}/comments`))
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${formId}/comments`));
  });
  it(`should allow GET for /hubs/general/forms/{id}/comments-count`, () => {
    return cloud.get(`${test.api}`)
      .then(r => cloud.get(`${test.api}/${r.body[0].id}/comments-count`));
  });
  it(`should allow GET, Pagination and CEQL search for /hubs/general/forms/{id}/entries`, () => {
    let formId;
    return cloud.get(`${test.api}`)
      .then(r => formId = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${formId}/entries`))
      .then(r => cloud.withOptions({ qs: { where: `entryId>2` } }).get(`${test.api}/${formId}/entries`))
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${formId}/entries`));
  });
  it(`should allow GET for /hubs/general/forms/{id}/entries-count`, () => {
    return cloud.get(`${test.api}`)
      .then(r => cloud.get(`${test.api}/${r.body[0].id}/entries-count`));
  });
  it(`should allow GET and Pagination for /hubs/general/forms/{id}/fields`, () => {
    let formId;
    return cloud.get(`${test.api}`)
      .then(r => formId = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${formId}/fields`))
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${formId}/fields`));
  });
  it(`should allow POST for /hubs/general/forms/{id}/entries`, () => {
    return cloud.get(`${test.api}`)
      .then(r => cloud.post(`${test.api}/${r.body[0].id}/entries`, payload));
  });
  test.should.supportPagination('id');
});
