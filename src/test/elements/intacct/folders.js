'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/folders.json`);
const patchPayload = tools.requirePayload(`${__dirname}/assets/foldersPatch.json`);


suite.forElement('finance', 'folders', { payload: payload }, (test) => {
  it(`should allow CRUDS for ${test.api}`, () => {
    let docid;
    return cloud.get(test.api)
      .then(r => docid = r.body[0].id)
      .then(r => cloud.post(`${test.api}`, payload))
      .then(r => cloud.get(`${test.api}/${docid}`))
      .then(r => cloud.patch(`${test.api}/${docid}`, patchPayload))
      .then(r => cloud.delete(`${test.api}/${docid}`));
  });
  test.should.supportPagination();
  test.withName('should support updated > {date} Ceql search').withOptions({ qs: { where: 'description=\'churros test case\'' } }).should.return200OnGet();
});
