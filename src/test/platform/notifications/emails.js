'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const email = require('./assets/email');
const emailSchema = require('./assets/email.schema');

suite.forPlatform('notifications/emails', {payload: email, email: emailSchema}, (test) => {

  test
  .withName('should send email')
  .withJson(email)
  .withValidation((r) => expect(r.body).to.be.empty)
  .should.return200OnPost({});

  test
  .withName('should send email with empty or null sender')
  .withJson({ to: email.to, subject: email.subject, message: email.message })
  .withValidation((r) => expect(r.body).to.be.empty)
  .should.return200OnPost({});

  test
  .withName('should fail for empty or null posted body')
  .withJson({})
  .withValidation((r) => expect(r.body).to.be.empty)
  .should.return400OnPost({});

  test
  .withName('should fail for empty or null recipient(s)')
  .withJson({ from: email.from, subject: email.subject, message: email.message })
  .withValidation((r) => expect(r.body).to.be.empty)
  .should.return400OnPost({});
});
