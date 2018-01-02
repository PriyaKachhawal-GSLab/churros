const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const tipPayload = tools.requirePayload(`${__dirname}/assets/tip.json`);
const tipUpdatePayload = tools.requirePayload(`${__dirname}/assets/tipUpdate.json`);


suite.forElement('employee', 'tips', (test) => {

  before(() => {
    return cloud.get('/users')
      .then(r => tipPayload.employee = r.body[0].resource_uri)
      .then(r => cloud.get('/locations'))
      .then(r => tipPayload.establishment = r.body[0].resource_uri)
      .then(r => {
        var utcDate = new Date(new Date().toUTCString());
        utcDate.setHours(utcDate.getHours() + 5); //Current PST time
        let tipTime = utcDate.toISOString().split('.')[0];
        tipPayload.tips_date = tipTime;
      });
  });

  test.should.supportPagination();

  test.withApi(test.api)
    .withOptions({ qs: { where: "date_range_to='2017-11-15T16:00:00Z'" } })
    .withValidation(r => expect(r.body.filter(obj => obj.created_date <= '2017-11-15T16:00:00Z')).to.not.be.empty)
    .withName('should allow GET with option date_range_to')
    .should.return200OnGet();

  test.withApi(test.api)
    .withOptions({ qs: { where: "date_range_from='2017-10-15T16:00:00Z'" } })
    .withValidation(r => expect(r.body.filter(obj => obj.created_date >= '2017-10-15T16:00:00Z')).to.not.be.empty)
    .withName('should allow GET with option date_range_from')
    .should.return200OnGet();

  it('Should allow CRUS for tips', () => {
    let tipId;
    return cloud.post(test.api, tipPayload)
      .then(r => tipId = r.body.id)
      .then(r => cloud.patch(`${test.api}/${tipId}`, tipUpdatePayload))
      .then(r => cloud.get(`${test.api}/${tipId}`))
      .then(r => cloud.get(test.api));

  });
});
