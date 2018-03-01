'use strict';

const suite = require('core/suite');
const payload = require('./assets/knowledge-articles');
const tools = require('core/tools');
const build = (overrides) => Object.assign({}, payload, overrides);
const artilesPayload = build({ title: tools.random() });

suite.forElement('crm', 'knowledge-articles', { payload: artilesPayload }, (test) => {
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
