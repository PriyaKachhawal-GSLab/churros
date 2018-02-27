'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/messages.json`);

suite.forElement('general', 'messages', { payload: payload }, (test) => {
  let messageId;
  let subject = payload.subject;
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
      .then(r => cloud.delete(`${test.api}/${messageId}`));
  });

  test.withApi(test.api).should.supportNextPagePagination(1);

});
