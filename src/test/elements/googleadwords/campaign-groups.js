'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const campaignGroupCreatePayload = tools.requirePayload(`${__dirname}/assets/campaign-groups-create.json`);
const campaignGroupUpdatePayload = tools.requirePayload(`${__dirname}/assets/campaign-groups-update.json`);

suite.forElement('general', 'campaign-groups', { payload: campaignGroupCreatePayload }, (test) => {
  const options = {
    churros: {
      updatePayload: campaignGroupUpdatePayload
    }
  };

  test.withOptions(options).should.supportCrds();
  test.should.supportPagination();
  test.should.supportCeqlSearch('id');
});
