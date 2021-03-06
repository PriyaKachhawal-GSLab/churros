'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/team-drives.json`);
const updatePayload = tools.requirePayload(`${__dirname}/assets/teamDrivesUpdate.json`);

suite.forElement('documents', 'team-drives', { payload: payload }, (test) => {
  /*
   * Teamdrive service must be enabled for the corresponding GSuite account
   */
  let createdTime = '2014-01-15T00:00:00.000Z';
  const options = {
    churros: {
      updatePayload: updatePayload
    }
  };
  test.withOptions(options).should.supportCruds();
  test.should.supportPagination();
  // Skipping below test case as it only works for 'Docs and Drive' admin privileged GSuite accounts
  test
    .withOptions({ skip: true, qs: { where: `createdTime >= '${createdTime}'` } })
    .withName('should support Ceql date search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => new Date(obj.createdTime).getTime() >= new Date(createdTime).getTime());
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
});
