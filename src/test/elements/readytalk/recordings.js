'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

suite.forElement('marketing', 'recordings', null, (test) => {
  test.should.supportSr();
  test.withOptions({ qs: { page: 1, pageSize: 5}}).should.return200OnGet();
  it('should get all meetings and then get recording by Id, registrations', () => {
    let recordingId;
    return cloud.get(test.api)
      .then(r => {
        expect(r.body.length).to.be.above(0);
        recordingId = r.body[0].id;
      })
      .then(r => cloud.get(`${test.api}/${recordingId}`))
      .then(r => cloud.get(`${test.api}/${recordingId}/registrations`));
  });    
});
