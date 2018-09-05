'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

let requisitionsCreatePayload = tools.requirePayload(`${__dirname}/assets/requisitions-create.json`);
let requisitionsUpdatePayload = tools.requirePayload(`${__dirname}/assets/requisitions-update.json`);

const options = {
    churros: {
      updatePayload: requisitionsUpdatePayload
    }
  };

suite.forElement('humancapital', 'requisitions', {payload : requisitionsCreatePayload}, (test) => {
    test.should.supportNextPagePagination(1);
    test.withOptions(options).should.supportCruds();
    test.should.supportCeqlSearchForMultipleRecords('city');
});