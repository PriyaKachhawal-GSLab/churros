'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

let candidatesCreatePayload = tools.requirePayload(`${__dirname}/assets/candidates-create.json`);
let candidatesUpdatePayload = tools.requirePayload(`${__dirname}/assets/candidates-update.json`);

const options = {
    churros: {
      updatePayload: candidatesUpdatePayload
    }
  };

suite.forElement('humancapital', 'candidates', {payload : candidatesCreatePayload}, (test) => {
    test.should.supportNextPagePagination(1);
    test.withOptions(options).should.supportCruds();
    test.should.supportCeqlSearchForMultipleRecords('city');
});