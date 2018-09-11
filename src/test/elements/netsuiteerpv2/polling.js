'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const customersPayload = tools.requirePayload(`${__dirname}/assets/customers-create.json`);
const employeesPayload = tools.requirePayload(`${__dirname}/assets/employees-create.json`);
const estimatesPayload = tools.requirePayload(`${__dirname}/assets/estimates-create.json`);
const invoicesPayload = tools.requirePayload(`${__dirname}/assets/invoices-create.json`);
const paymentsPayload = tools.requirePayload(`${__dirname}/assets/payments-create.json`);
const journalEntriesPayload = tools.requirePayload(`${__dirname}/assets/journal-entries-create.json`);
const productsPayload = tools.requirePayload(`${__dirname}/assets/products-create.json`);
const purchaseOrdersPayload = tools.requirePayload(`${__dirname}/assets/purchase-orders-create.json`);
const vendorPaymentsPayload = tools.requirePayload(`${__dirname}/assets/vendor-payments-create.json`);
const vendorsPayload = tools.requirePayload(`${__dirname}/assets/vendors-create.json`);
const accountsPayload = tools.requirePayload(`${__dirname}/assets/accounts-create.json`);
const contactsPayload = tools.requirePayload(`${__dirname}/assets/contacts-create.json`);
const leadsPayload = tools.requirePayload(`${__dirname}/assets/leads-create.json`);
const activitiesPayload = tools.requirePayload(`${__dirname}/assets/activities-create.json`);
const opportunitiesPayload = tools.requirePayload(`${__dirname}/assets/opportunities-create.json`);
const timeActivitiesPayload = tools.requirePayload(`${__dirname}/assets/time-activities-create.json`);

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
  test.withApi('/hubs/erp/accounts').should.supportPolling(accountsPayload, 'accounts');
  test.withApi('/hubs/erp/contacts').should.supportPolling(contactsPayload, 'contacts');
  test.withApi('/hubs/erp/leads').should.supportPolling(leadsPayload, 'leads');
  test.withApi('/hubs/erp/activities').should.supportPolling(activitiesPayload, 'activities');
  test.withApi('/hubs/erp/opportunities').should.supportPolling(opportunitiesPayload, 'opportunities');
  test.withApi('/hubs/erp/time-activities').should.supportPolling(timeActivitiesPayload, 'time-activities');
});
