'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const contentSectionsCreatePayload = tools.requirePayload(`${__dirname}/assets/contentSections-create.json`);
const contentSectionsUpdatePayload = tools.requirePayload(`${__dirname}/assets/contentSections-update.json`);


suite.forElement('marketing', 'content-sections', { payload: contentSectionsCreatePayload }, (test) => {
  const opts = {
    churros: {
      updatePayload : contentSectionsUpdatePayload
    }
  };
  test.withOptions(opts).should.supportCruds();
  test.withOptions({ qs: { pageSize: 10 }}).should.supportPagination('id');
  test.should.supportCeqlSearchForMultipleRecords('name');
});
