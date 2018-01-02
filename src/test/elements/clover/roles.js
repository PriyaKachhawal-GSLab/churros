const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const rolesPayload = tools.requirePayload(`${__dirname}/assets/roles.json`);
const rolesUpdatePayload = tools.requirePayload(`${__dirname}/assets/rolesUpdate.json`);

suite.forElement('employee', 'roles', { payload: rolesPayload }, (test) => {

  test.should.supportPagination();

  test.withApi(test.api)
    .withOptions({ qs: { where: "name='Manager'" } })
    .withValidation(r => expect(r.body.filter(obj => obj.name === 'Manager')).to.not.be.empty)
    .withName('should allow GET with option name')
    .should.return200OnGet();

  test.withApi(test.api)
    .withOptions({ qs: { where: "systemRole='EMPLOYEE'" } })
    .withValidation(r => expect(r.body.filter(obj => obj.systemRole === 'EMPLOYEE')).to.not.be.empty)
    .withName('should allow GET with option systemRole')
    .should.return200OnGet();

  it('should allow CRUDS for roles', () => {
    let roleId;
    let arr = ['EMPLOYEE', 'ADMIN', 'MANAGER'];
    rolesPayload.systemRole = arr[Math.floor(Math.random() * arr.length)];
    return cloud.post(test.api, rolesPayload)
      .then(r => roleId = r.body.id)
      .then(r => cloud.get(`${test.api}/${roleId}`))
      .then(r => cloud.patch(`${test.api}/${roleId}`, rolesUpdatePayload))
      .then(r => expect(r.body.systemRole === 'EMPLOYEE'))
      .then(r => cloud.delete(`${test.api}/${roleId}`))
      .then(r => cloud.get(test.api));
  });
});
