'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const currenciesCreatePayload = tools.requirePayload(`${__dirname}/assets/currencies-create.json`);
const currenciesUpdatePayload = tools.requirePayload(`${__dirname}/assets/currencies-update.json`);

const options = {
  churros: {
    updatePayload: currenciesUpdatePayload
  }
};

suite.forElement('erp', 'currencies', { payload : currenciesCreatePayload }, (test) => {
  currenciesCreatePayload.symbol = tools.randomStr("AMNBGHJOPEIOU", 3);
  currenciesUpdatePayload.symbol = tools.randomStr("AMNBGHJOPEIOU", 3);
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
});