'use strict';

const suite = require('core/suite');
const payload = require('./assets/cases');
const tools = require('core/tools');
const build = (overrides) => Object.assign({}, payload, overrides);
const casesPayload = build({ name: tools.random() });

suite.forElement('crm', 'cases', { payload: casesPayload }, (test) => {
  const options = {
    churros: {
      updatePayload: {
        attributes: {
        "title": tools.random()
        }
      }
    }
  };
  test.withOptions(options).should.supportCruds();
  test.should.supportPagination();
  test.should.supportCeqlSearch('id');
});
