'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const landingPagesCreatePayload =  tools.requirePayload(`${__dirname}/assets/landingPages-create.json`);
const landingPagesUpdatePayload =  tools.requirePayload(`${__dirname}/assets/landingPages-update.json`);


suite.forElement('marketing', 'landing-pages', { payload: landingPagesCreatePayload }, (test) => {
const opts = {
    churros: {
      updatePayload : landingPagesUpdatePayload
   }
  };
      
  test.withOptions(opts).should.supportCruds();
  test.should.supportPagination();
  test.should.supportCeqlSearchForMultipleRecords('name');
});
