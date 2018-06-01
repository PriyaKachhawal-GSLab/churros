'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = {
  "attributes": {
    "accountLocked": true,
    "canModifyEmailSignature": true,
    "forcePasswordChange": true,
    "passwordNeverExpires": true,
    "permanentlyDisabled": true,
    "staffAssignmentDisabled": true,
    "viewsReportsDisabled": true
  },
  "login": tools.random(),
  "newPassword": tools.randomStr('abcdefghijklmnopqrstuvwxyz', 10) + "@Abc123",
  "name": {
    "last": tools.random(),
    "first": tools.random()
  },
  "profile": {
    "id": {
      "id": 1
    }
  },
  "staffGroup": {
    "id": {
      "id": 100001
    }
  }
};

suite.forElement('helpdesk', 'agents', { payload: payload }, (test) => {
  const updatePayload = {
        "login": tools.random()
  };

  test.withOptions({ churros: { updatePayload: updatePayload } }).should.supportCruds();
  test.should.supportPagination();
  test.should.supportCeqlSearch('login');

});
