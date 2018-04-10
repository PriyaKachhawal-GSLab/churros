'use strict';

const suite = require('core/suite');
const chakram = require('chakram');
const expect = chakram.expect;
const cloud  = require('core/cloud');
suite.forElement('humancapital', 'source-types', (test) => {
var Id;
  before(() => cloud.get(`${test.api}`)
    .then(r => Id = r.body[0].id));
  test.should.return200OnGet();
  test.should.supportPagination();
  it('should support S for /jobs/:id/notes', () => {
    return cloud.get(`${test.api}/${Id}/sub-types`)
      .then(r => cloud.withOptions({ qs: { pageSize: 1 } }).get(`${test.api}/${Id}/sub-types`))
      .then(r => cloud.withOptions({ qs: { page : 1, pageSize: 1 } }).get(`${test.api}/${Id}/sub-types`))
      .then(r => cloud.withOptions({ qs: { where: `sourceSubType = 'BOARD'` } }).get(`${test.api}/${Id}/sub-types`))
      .then(r => expect(r.body.length).to.equal(r.body.filter(obj => obj.sourceSubType.id === 'BOARD').length));
  });
});
