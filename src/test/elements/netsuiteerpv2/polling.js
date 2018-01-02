'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const customersPayload = tools.requirePayload(`${__dirname}/assets/customers.json`);
const employeesPayload = tools.requirePayload(`${__dirname}/assets/employees.json`);
const estimatesPayload = require('./assets/estimates');
const invoicesPayload = require('./assets/invoices');
const paymentsPayload = require('./assets/payments');
const journalEntriesPayload = require('./assets/journal-entries');
const productsPayload = tools.requirePayload(`${__dirname}/assets/products.json`);
const purchaseOrdersPayload = require('./assets/purchase-orders');
const vendorPaymentsPayload = require('./assets/vendor-payments');
const vendorsPayload = tools.requirePayload(`${__dirname}/assets/vendors.json`);

//netsuite isn't polling correctly, unskip when it works
suite.forElement('erp', 'polling', { skip: false }, (test) => {
  test.withApi('/hubs/erp/customers').should.supportPolling(customersPayload, 'customers');
  test.withApi('/hubs/erp/employees').should.supportPolling(employeesPayload, 'employees');
  test.withApi('/hubs/erp/estimates').should.supportPolling(estimatesPayload, 'estimates');
  test.withApi('/hubs/erp/invoices').should.supportPolling(invoicesPayload, 'invoices');
  test.withApi('/hubs/erp/payments').should.supportPolling(paymentsPayload, 'payments');
  test.withApi('/hubs/erp/journal-entries').should.supportPolling(journalEntriesPayload, 'journal-entries');
  test.withApi('/hubs/erp/products').should.supportPolling(productsPayload, 'products');
  test.withApi('/hubs/erp/purchase-orders').should.supportPolling(purchaseOrdersPayload, 'purchase-orders');
  test.withApi('/hubs/erp/vendor-payments').should.supportPolling(vendorPaymentsPayload, 'vendor-payments');
  test.withApi('/hubs/erp/vendors').should.supportPolling(vendorsPayload, 'vendors');
});
