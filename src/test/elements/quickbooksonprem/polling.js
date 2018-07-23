'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const creditMemosPayload = require('./assets/credit-memos');
const customersPayload = tools.requirePayload(`${__dirname}/assets/customers.json`);
const employeesPayload = tools.requirePayload(`${__dirname}/assets/employees.json`);
const invoicesPayload = tools.requirePayload(`${__dirname}/assets/invoices.json`);
const itemReceiptsPayload = tools.requirePayload(`${__dirname}/assets/item-receipts.json`);
const journalEntriesPayload = tools.requirePayload(`${__dirname}/assets/journal-entries.json`);
const payrollWagePayload = tools.requirePayload(`${__dirname}/assets/payroll-wage-items.json`);
const productsPayload = tools.requirePayload(`${__dirname}/assets/products.json`);
const purchaseOrdersPayload = require('./assets/purchase-orders');
const salesOrdersPayload = require('./assets/sales-orders');
const salesReceiptsPayload = require('./assets/sales-receipts');
const vendorPayload = tools.requirePayload(`${__dirname}/assets/vendors.json`);

suite.forElement('finance', 'polling', null, (test) => {
  test.withApi('/hubs/finance/credit-memos').should.supportPolling(creditMemosPayload, 'credit-memos');
  test.withApi('/hubs/finance/customers').should.supportPolling(customersPayload, 'customers');
  test.withApi('/hubs/finance/employees').should.supportPolling(employeesPayload, 'employees');
  test.withApi('/hubs/finance/invoices').should.supportPolling(invoicesPayload, 'invoices');
  test.withApi('/hubs/finance/item-receipts').should.supportPolling(itemReceiptsPayload, 'item-receipts');
  test.withApi('/hubs/finance/journal-entries').should.supportPolling(journalEntriesPayload, 'journal-entries');
  test.withApi('/hubs/finance/payroll-wage-items').should.supportPolling(payrollWagePayload, 'payroll-wage-items');
  test.withApi('/hubs/finance/products').should.supportPolling(productsPayload, 'products');
  test.withApi('/hubs/finance/purchase-orders').should.supportPolling(purchaseOrdersPayload, 'purchase-orders');
  test.withApi('/hubs/finance/sales-orders').should.supportPolling(salesOrdersPayload, 'sales-orders');
  test.withApi('/hubs/finance/sales-receipts').should.supportPolling(salesReceiptsPayload, 'sales-receipts');
  test.withApi('/hubs/finance/vendors').should.supportPolling(vendorPayload, 'vendors');
});