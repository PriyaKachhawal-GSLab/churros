'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/team-drives.json`);

suite.forElement('documents', 'team-drives', { payload: payload}, (test) => {
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
});
