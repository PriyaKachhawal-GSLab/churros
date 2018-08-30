'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const biddingStrategyCreatePayload = tools.requirePayload(`${__dirname}/assets/bidding-strategies-create.json`);
const biddingStrategyUpdatePayload = tools.requirePayload(`${__dirname}/assets/bidding-strategies-create.json`);


suite.forElement('general', 'bidding-strategies', { payload: biddingStrategyCreatePayload }, (test) => {
  const options = {
    churros: {
      updatePayload: biddingStrategyUpdatePayload
    }
  };

  test.withOptions(options).should.supportCrds();
  test.should.supportPagination();
  test.should.supportCeqlSearch('id');
});
