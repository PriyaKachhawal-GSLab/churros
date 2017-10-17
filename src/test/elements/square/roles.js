const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const rolePayload = tools.requirePayload(`${__dirname}/assets/rolePayload.json`);
const roleUpdatePayload = tools.requirePayload(`${__dirname}/assets/roleUpdatePayload.json`);

suite.forElement('employee', 'roles', (test) => {

  test.should.supportPagination();

  it('should allow CRUD for roles', () => {
    let roleId, len;

    return cloud.post(`${test.api}`, rolePayload)
    .then(r => roleId = r.body.id)
    .then(r => cloud.get(`${test.api}/${roleId}`))
    .then(r => cloud.patch(`${test.api}/${roleId}`, roleUpdatePayload))
    .then(cloud.get(test.api));
  });
});
