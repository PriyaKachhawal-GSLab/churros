'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const attachmentQuery =  tools.requirePayload(`${__dirname}/assets/attachments-requiredQueryParam-c.json`);

suite.forElement('helpdesk', 'attachments', null, (test) => {
  it('should support Crd for attachments', () => {
    let attachmentId;
    return cloud.withOptions({ qs: attachmentQuery }).postFile(test.api, __dirname + '/assets/attachments-create.txt')
      .then(r => attachmentId = r.body.id)
      .then(r => cloud.get(`${test.api}/${attachmentId}`))
      .then(r => cloud.delete(`${test.api}/${attachmentId}`));
  });
});
