'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const payload = require('./assets/attachment');
const schema = require('./assets/objects.attachments.json');

suite.forElement('finance', 'attachments', { payload: payload, skip:true }, (test) => {
  it(`should allow CRUDS for ${test.api}`, () => {
    let docid;
    return cloud.get(test.api)
      .then(r => docid = r.body[1].id)
      .then(r => cloud.post(`${test.api}`, payload))
      .then(r => cloud.get(`${test.api}/${docid}`))
      .then(r => cloud.patch(`${test.api}/${docid}`, payload))
      .then(r => cloud.delete(`${test.api}/${docid}`));
  });
  test.should.supportPagination();
  test.withValidation(schema).withName('should support updated > {date} Ceql search').withOptions({ qs: { where: 'creationdate>\'11/21/2017\'' } }).should.return200OnGet();
});
