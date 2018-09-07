'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const chakram = require('chakram');
const expect = chakram.expect;
const payload = tools.requirePayload(`${__dirname}/assets/journal-codes.json`);

//Need to skip as the resource  only works in the France locale on QBO
suite.forElement('finance', 'journal-codes', { payload: payload, skip: true }, (test) => {
  let entityId;
  let putPayload;
  test.should.supportSr();
  test.withOptions({ skip: true }).should.return200OnPost();
  it(`should support update on ${test.api}`, () => {
    return cloud.get(test.api)
      .then(r => {
        entityId = r.body[0].id;
        putPayload = r.body[0];
        delete putPayload.id;
        delete putPayload.metaData;
      })
      .then(cloud.put(`${test.api}/${entityId}`, putPayload));
  });
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.return200OnGet();
  test.withName(`should support searching ${test.api} by Name`)
    .withOptions({ qs: { where: `Name ='VT'` } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.Name = 'VT');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
});
