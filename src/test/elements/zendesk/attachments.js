'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('helpdesk', 'attachments', null, (test) => {
  it('should support Crd for attachments', () => {
    let attachmentId;
    let query = { fileName: "attach.txt" };
    return cloud.withOptions({ qs: query }).postFile(test.api, __dirname + '/assets/attachments-create.txt')
      .then(r => attachmentId = r.body.id)
      .then(r => cloud.get(`${test.api}/${attachmentId}`))
      .then(r => cloud.delete(`${test.api}/${attachmentId}`));
  });
});
