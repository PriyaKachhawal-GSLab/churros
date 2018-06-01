'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/messages.json`);
const messagesAttachment = tools.requirePayload(`${__dirname}/assets/messagesAttachment.json`);
const messagesForward = tools.requirePayload(`${__dirname}/assets/messagesForward.json`);
const messagesReply = tools.requirePayload(`${__dirname}/assets/messagesReply.json`);

suite.forElement('general', 'messages', { payload: payload }, (test) => {
  var messageId;
  before(() => cloud.post(test.api, payload)
    .then(r => cloud.get(test.api))
    .then(r => messageId = r.body[0].Id));

  it('Should allow CRUDS for /messages', () => {
    const updatePayload = {
      "Body": {
        "ContentType": "HTML",
        "Content": "They were <b>awesome</b>!"
      }
    };
    var newMessageId;
    return cloud.post(test.api, payload)
      .then(r => cloud.get(test.api))
      .then(r => newMessageId = r.body[0].Id)
      .then(r => cloud.get(`${test.api}/${newMessageId}`))
      .then(r => cloud.patch(`${test.api}/${newMessageId}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${newMessageId}`));
  });
  test.should.supportPagination('Id');

  it('Should allow CDS for /messages/{id}/attachments', () => {
    var attachmentId;
    return cloud.post(`${test.api}/${messageId}/attachments`, messagesAttachment)
      .then(r => cloud.get(`${test.api}/${messageId}/attachments`))
      .then(r => attachmentId = r.body[0].Id)
      .then(r => cloud.delete(`${test.api}/${messageId}/attachments/${attachmentId}`));
  });


  it('Should allow POST for /messages/{id}/forward,reply and replyall ', () => {
    return cloud.post(`${test.api}/${messageId}/forward`, messagesForward)
      .then(r => cloud.post(`${test.api}/${messageId}/reply`, messagesReply))
      .then(r => cloud.post(`${test.api}/${messageId}/replyall`, messagesReply));
  });

  test
    .withOptions({ qs: { orderBy: `ReceivedDateTime desc'` } })
    .withName('Should support orderBy for date')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      expect(r.body.length).to.be.at.least(2);
      const success = new Date(r.body[0].ReceivedDateTime).getTime() > new Date(r.body[1].ReceivedDateTime).getTime();
      expect(success).to.be.true;
    })
    .should.return200OnGet();

  test
    .withOptions({ qs: { where: `ReceivedDateTime >= '2017-05-25T08:45:40Z'` } })
    .withName('Should support Ceql date search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => new Date(obj.ReceivedDateTime).getTime() >= 1495701940000); //2017-05-25T08:45:40Z is equivalent to 1495701940000
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();

  after(() => cloud.delete(`${test.api}/${messageId}`));
});
