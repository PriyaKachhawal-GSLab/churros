const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const employeePayload = tools.requirePayload(`${__dirname}/assets/employee.json`);
const employeeUpdatePayload = tools.requirePayload(`${__dirname}/assets/employeeUpdate.json`);

suite.forElement('employee', 'employees', (test) => {

  let user;
  before(() => {
    return cloud.get(test.api)
      .then(r => {
        let arr = r.body[0].user.split('/');
        user = arr[3];
      })
      .then(r => cloud.get('/users'))
      .then(r => {
        employeePayload.created_by = r.body[0].resource_uri;
        employeePayload.updated_by = r.body[0].resource_uri;
      })
      .then(r => cloud.get('/brands'))
      .then(r => employeePayload.brand = r.body[0].resource_uri)
      .then(r => {
        var utcDate = new Date(new Date().toUTCString());
        utcDate.setHours(utcDate.getHours() + 5); //Current PTC dateTime
        let startDate = utcDate.toISOString().split('.')[0];
        employeePayload.employee_start = startDate;
      });
  });

  test.should.supportPagination();

  test.withApi(test.api)
    .withOptions({ qs: { where: "updated_date__lte='2017-11-15T16:00:00Z'" } })
    .withValidation(r => expect(r.body.filter(obj => obj.updated_date <= '2017-11-15T16:00:00Z')).to.not.be.empty)
    .withName('should allow GET with option updated_date__lte')
    .should.return200OnGet();

  test.withApi(test.api)
    .withOptions({ qs: { where: "created_date__gte='2017-09-15T16:00:00Z'" } })
    .withValidation(r => expect(r.body.filter(obj => obj.created_date >= '2017-09-15T16:00:00Z')).to.not.be.empty)
    .withName('should allow GET with option created_date__gte')
    .should.return200OnGet();

  it(`should allow GET with option user for ${test.api}`, () => {
    return cloud.withOptions({ qs: { where: `user = '${user}'` } }).get(test.api)
      .then(r => expect(r.body.filter(obj => obj.user === `/enterprise/User/'${user}'/`)).to.not.be.null);
  });

  it('Should allow CRUS for employees', () => {
    let empId;
    return cloud.post(test.api, employeePayload) //Should change payload while running.
      .then(r => empId = r.body.id)
      .then(r => cloud.patch(`${test.api}/${empId}`, employeeUpdatePayload))
      .then(r => cloud.get(`${test.api}/${empId}`))
      .then(r => cloud.get(`${test.api}/${empId}/tips`))
      .then(r => cloud.get(test.api));
  });
});
