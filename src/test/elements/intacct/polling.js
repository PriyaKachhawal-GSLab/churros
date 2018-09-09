'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const customersPayload = tools.requirePayload(`${__dirname}/assets/customers-create.json`);
const employeesPayload = tools.requirePayload(`${__dirname}/assets/employees-create.json`);
const invoicesPayload = tools.requirePayload(`${__dirname}/assets/invoices-create.json`);
const itemsPayload = tools.requirePayload(`${__dirname}/assets/items-create.json`);
const journalsPayload = tools.requirePayload(`${__dirname}/assets/journals-create.json`);
const ledgerAccountsPayload = tools.requirePayload(`${__dirname}/assets/ledger-accounts-create.json`);
const paymentsPayload = tools.requirePayload(`${__dirname}/assets/payments-create.json`);
const vendorsPayload = tools.requirePayload(`${__dirname}/assets/vendors-create.json`);

suite.forElement('finance', 'polling', null, (test) => {
  test.withApi('/hubs/finance/customers').should.supportPolling(customersPayload, 'customers');
  test.withApi('/hubs/finance/employees').should.supportPolling(employeesPayload, 'employees');
  test.withApi('/hubs/finance/invoices').should.supportPolling(invoicesPayload, 'invoices');
  test.withApi('/hubs/finance/items').should.supportPolling(itemsPayload, 'items');
  test.withApi('/hubs/finance/journals').should.supportPolling(journalsPayload, 'journals');
  test.withApi('/hubs/finance/ledger-accounts').should.supportPolling(ledgerAccountsPayload, 'ledger-accounts');
  test.withApi('/hubs/finance/payments').should.supportPolling(paymentsPayload, 'payments');
  test.withApi('/hubs/finance/vendors').should.supportPolling(vendorsPayload, 'vendors');
});
