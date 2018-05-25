'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/messages.json`);
const updatePayload = tools.requirePayload(`${__dirname}/assets/updateMessages.json`);
const updateMultiple = tools.requirePayload(`${__dirname}/assets/updateMultipleMessages.json`);

suite.forElement('general', 'messages', { payload: payload }, (test) => {
  let messageId;
  let subject = payload.subject;
  let attachmentId;
  
  it('should test CSRD /messages and CEQL search', () => {
      let path = __dirname + '/assets/MrRobotPdf.pdf';
      const opts = { formData: { body: JSON.stringify(payload) } };
      return cloud.withOptions(opts).postFile(test.api, path)
      .then(r => messageId = r.body.id)
      .then(r => cloud.withOptions({ qs: { where:`q=\'subject:${subject}\'`  } }).get(`${test.api}`))
	    .then(r => {
			 expect(r).to.statusCode(200);
			 expect(r.body.length).to.be.equal(1);
	    })
      .then(r => cloud.get(test.api))
      .then(r => cloud.get(`${test.api}/${messageId}`))
      .then(r => attachmentId = r.body.payload.parts[1].body.attachmentId)
      .then(r => cloud.get(`${test.api}/${messageId}/attachments/${attachmentId}`))
      .then(r => cloud.patch(`${test.api}/${messageId}`, updatePayload))
      .then(r => cloud.post(`${test.api}/${messageId}/trash`))
      .then(r => cloud.post(`${test.api}/${messageId}/untrash`))
      .then(r => cloud.delete(`${test.api}/${messageId}`))
      .then(r => cloud.withOptions(opts).postFile(`${test.api}/import`, path))
      .then(r => messageId = r.body.id)
      .then(r => {
        updateMultiple.ids[0] = messageId;
        })
      .then(r => cloud.patch(`${test.api}/multiple`, updateMultiple));
  });
  test.withApi(test.api).should.supportNextPagePagination(1);
});
