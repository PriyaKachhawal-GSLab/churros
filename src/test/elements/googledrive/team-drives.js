'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/team-drives.json`);

suite.forElement('documents', 'team-drives', { payload: payload }, (test) => {
  /*
  * Teamdrive service must be enabled for the corresponding GSuite account
  */
  const options = {
    churros: {
      updatePayload: {
        "capabilities": {
          "canChangeTeamDriveBackground": true,
          "canReadRevisions": true,
          "canDeleteTeamDrive": true,
          "canEdit": true,
          "canShare": true,
          "canRename": true,
          "canRenameTeamDrive": true,
          "canAddChildren": true,
          "canListChildren": true,
          "canManageMembers": true,
          "canRemoveChildren": true,
          "canCopy": true,
          "canDownload": true,
          "canComment": true
        },
        "name": "TempDrive",
        "colorRgb": "#5c6bc0"
      }
    }
  };
  test.withOptions(options).should.supportCruds();
  test.should.supportPagination();
  test
    .withOptions({ qs: { where: `createdTime >= '2014-01-15T00:00:00.000Z'` } })
    .withName('should support Ceql date search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => new Date(obj.createdTime).getTime() >= 1389744000000);
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
});
