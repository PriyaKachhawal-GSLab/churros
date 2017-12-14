'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('general', 'messages', null , (test) => {
  let messageId;
  it('should test SRD messages', () => {
  return cloud.get(test.api)
   .then(r => messageId = r.body[0].id)
   .then(r => cloud.get(`${test.api}/${messageId}`))
   .then(r => cloud.post(`${test.api}/${messageId}/trash`, null));
  });

  test.withApi(test.api).should.supportNextPagePagination(1);

});
