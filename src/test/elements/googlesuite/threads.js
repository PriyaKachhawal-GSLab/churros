'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('general', 'threads', null , (test) => {

  let threadId;
  it('should test SRD /threads', () => {
  return cloud.get(test.api)
   .then(r => threadId = r.body[0].id)
   .then(r => cloud.get(`${test.api}/${threadId}`))
   .then(r => cloud.post(`${test.api}/${threadId}/trash`, null));
  });

  test.withApi(test.api).should.supportNextPagePagination(1);

});
