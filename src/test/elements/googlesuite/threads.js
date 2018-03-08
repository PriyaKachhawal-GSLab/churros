'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const tools = require('core/tools');
const message = tools.requirePayload(`${__dirname}/assets/messages.json`);

suite.forElement('general', 'threads', null, (test) => {
	  let messageId;
    let path = __dirname + '/assets/MrRobotPdf.pdf';
    const opts = { formData: { body: JSON.stringify(message) } };
  before(() => cloud.withOptions(opts).postFile('/hubs/general/messages', path)
	.then(r => messageId = r.body.id));

  it(`should test CEQL search for ${test.api}`, () => {
	  let subject = message.subject;
      return cloud.withOptions({ qs: { where:`q=\'subject:${subject}\'`  } }).get(`${test.api}`)
	  .then(r => {
			expect(r).to.statusCode(200);
			expect(r.body.length).to.be.equal(1);
	   });
  });

  it('should test SRD /threads', () => {
  let threadId;
    return cloud.get(test.api)
      .then(r => threadId = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${threadId}`))
      .then(r => cloud.delete(`${test.api}/${threadId}`));
  });

  test.withApi(test.api).should.supportNextPagePagination(1);

  after(() =>cloud.delete(`/hubs/general/messages/${messageId}`));
});
