'use strict';
const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/users.json`);
const employeePayload = tools.requirePayload(`${__dirname}/assets/employees.json`);
const employmentPayload = tools.requirePayload(`${__dirname}/assets/employment.json`);
const jobPayload = tools.requirePayload(`${__dirname}/assets/job.json`);
const personalPayload = tools.requirePayload(`${__dirname}/assets/personal.json`);
const cloud = require('core/cloud');
const expect = require('chakram').expect;

suite.forElement('Humancapital', 'employees', { payload: employeePayload }, (test) => {
  let userId;
  let employeeId;
  let managerId;
  before((done) => cloud.post('user-Accounts', payload)
    .then(r => {
      userId = r.body.id;
      employeePayload.userId = userId
    })
    .then(r => cloud.post(test.api, employeePayload))
    .then(r => employeeId = employeePayload.personIdExternal)
    .then(r => done())
  );

  it(`should support CRS for ${test.api}/{id}/employments`, () => {
    employmentPayload.userId = userId;
    employmentPayload.personIdExternal = employeeId;
    return cloud.post(`${test.api}/${employeeId}/employments`, employmentPayload)
      .then(r => cloud.get(`${test.api}/${employeeId}/employments`))
      .then(r => cloud.withOptions({ qs: {page : 1, pageSize: 1 } }).get(`${test.api}/${employeeId}/employments`))
      .then(r => cloud.get(`${test.api}/${employeeId}/employments/${userId}`));
  });

  it(`should support CEQL search for ${test.api}/{id}/employments`, () => {
    return cloud.withOptions({ qs: { where: `userId='${userId}'` } }).get(`${test.api}/${employeeId}/employments`)
      .then(r => {
        expect(r.body).to.not.be.empty;
        expect(r.body.length).to.equal(1);
        expect(r.body[0].userId).to.equal(userId);
      });
  });

  //Skip the test as we do not have valid payload for this creation. Raised ticket with SuccessFactor support team.
  it.skip(`should support C for ${test.api}/jobs`, () => {
    return cloud.post(`${test.api}/${userId}/jobs`, jobPayload);
  });

  it(`should support RS for ${test.api}/jobs`, () => {
    return cloud.withOptions({ qs: {sequenceNumber: '1L', startDate: '2010-01-01T00:00:00'}}).get(`${test.api}/VictorK/jobs`)
      .then(r => cloud.get(`${test.api}/jobs`));
  });
  test.withApi(`${test.api}/jobs`).should.supportPagination();

  it(`should support CEQL search for ${test.api}/jobs`, () => {
    managerId = jobPayload.managerId;
    return cloud.withOptions({ qs: { where: `managerId='${managerId}'` } }).get(`${test.api}/jobs`)
      .then(r => {
        expect(r.body).to.not.be.empty;
        expect(r.body[0].results[0].managerId).to.equal(managerId);
      });
  });

  it(`should support CS for ${test.api}/{id}/personal`, () => {
    return cloud.post(`${test.api}/${employeeId}/personal`, personalPayload)
      .then(r => cloud.get(`${test.api}/${employeeId}/personal`))
      .then(r => cloud.withOptions({qs: {page: 1, pageSize: 1}}).get(`${test.api}/${employeeId}/personal`));
  });

  it(`should support SR for ${test.api}/{id}/addresses`, () => {
   //The endpoint supports different date format than what is returned in GET response. So startDate is hardcoded here
   //Hardcoding the value for EmployeeID field as there is no post API supported for this to later get that record
   let id;
   let startDate1;
   let addressType1;
   return cloud.get(`${test.api}/104064/addresses`)
      .then(r =>{ id = r.body[0].addressType})
      .then(r => cloud.withOptions( { qs: {startDate : '2013-07-06T00:00:00', expand : 'countryNav' }}).get(`${test.api}/104064/addresses/${id}`))
    });

  it(`should support SR for ${test.api}/{userId}/compensations`, () => {
  //The endpoint supports different date format than what is returned in GET response. So startDate is hardcoded here
  //Hardcoded the value of userId as there is no POST API for this and every user does not have compensations. Also we need date field accordingly.
    let id,userId;
    return cloud.withOptions( { qs: {startDate : '1997-01-01T00:00:00'}}).get(`${test.api}/107030/compensations`);
  });

  it(`should support SR for ${test.api}/{id}/emergency-contacts`, () => {
  //The endpoint supports different date format than what is returned in GET response. So startDate is hardcoded here
  //Hardcoding the value for EmployeeID field as there is no post API supported for this to later get that record
    let id;
    let relationship;
    let name;
    return cloud.get(`/${test.api}/108731/emergency-contacts`)
      .then(r =>{ id = r.body[0].personIdExternal; relationship = r.body[0].relationship;  name = r.body[0].name})
      .then(r => cloud.withOptions( { qs: {relationship : relationship, expand : 'personNav' }}).get(`${test.api}/${id}/emergency-contacts/${name}`));
  });

  it(`should support SR for ${test.api}/{id}/phones`, () => {
  //Hardcoding the value for EmployeeID field as there is no post API supported for this to later get that record 
    let id;
    let phoneType;
    return cloud.get(`${test.api}/108731/phones`)
      .then(r =>{ id = r.body[0].personIdExternal; phoneType = r.body[0].phoneType;})
      .then(r => cloud.withOptions( { qs: {phoneType : phoneType}}).get(`${test.api}/${id}/phones/${phoneType}`));
  });

  it(`should support SR for ${test.api}/{id}/relationships`, () => {
  //Hardcoding the value for EmployeeID field as there is no post API supported for this to later get that record
    let id;
    let relatedPersonIdExternal;
    return cloud.get(`${test.api}/103201/relationships`)
      .then(r =>{ id = r.body[0].personIdExternal; relatedPersonIdExternal = r.body[0].relatedPersonIdExternal})
      .then(r => cloud.withOptions( { qs: {relatedPersonIdExternal : relatedPersonIdExternal, startDate : '2018-04-16T00:00:00',  expand : 'relPersonalNav'}}).get(`${test.api}/${id}/relationships/${relatedPersonIdExternal}`))
  });

  it(`should support SR for ${test.api}/{id}/emails`, () => {
  //Hardcoding the value for EmployeeID field as there is no post API supported for this to later get that record
    let id;
    let emailType;
    return cloud.get(`${test.api}/103201/emails`)
    .then(r =>{ id = r.body[0].personIdExternal; emailType = r.body[0].emailType})
    .then(r => cloud.withOptions( { qs: {expand : 'emailTypeNav'}}).get(`${test.api}/${id}/emails/${emailType}`));
  });
});
