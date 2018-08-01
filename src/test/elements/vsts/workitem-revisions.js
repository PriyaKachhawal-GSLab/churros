const suite = require('core/suite');
const cloud = require('core/cloud');
var workItemId = 30;
var revision = ``;
suite.forElement('collaboration', 'work-items', (test) => {
  it('should allow RS for /work-items/{workItemId}/revisions', () => {
    return cloud.get(`${test.api}/${workItemId}/revisions`).
    then(r => {
      revision = r.body[0].rev;
    }).then(r => cloud.get(`${test.api}/${workItemId}/revisions/${revision}`));
  });
});