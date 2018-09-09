 const suite = require('core/suite');
  const cloud = require('core/cloud');
  const tools = require('core/tools');
  const customersCreatePayload = tools.requirePayload(`${__dirname}/assets/customers-create.json`);
  const invoicesCreatePayload = tools.requirePayload(`${__dirname}/assets/invoices-create.json`);
  const paymentsCreatePayload = tools.requirePayload(`${__dirname}/assets/payments-create.json`);
  const payloadApply = require('./assets/payments-apply-create');

  suite.forElement('finance', 'payments', { payload: paymentsCreatePayload,skip: true}, (test) => {
    let customerId, invoiceKey, arpaymentkey;
    it(`should allow CRS for ${test.api}`, () => {
      return cloud.crs(test.api, paymentsCreatePayload);
    });
    test.should.supportPagination();
    test.withName('should support updated > {date} Ceql search').withOptions({ qs: { where: 'whenmodified>\'08/13/2016 05:26:37\'' } }).should.return200OnGet();
    it(`should allow C for ${test.api}/{id}/apply`, () => { //since it have no delete support
      return cloud.post('/hubs/finance/customers', customersCreatePayload)
        .then(r => {
          customerId = r.body.id;
          paymentsCreatePayload.customerid = customerId;
          invoicesCreatePayload.customerid=customerId;
        })
        .then(r => cloud.post('/hubs/finance/invoices', invoicesCreatePayload))
        .then(r => invoiceKey = r.body.id)
        .then(r => cloud.post(test.api, paymentsCreatePayload))
        .then(r => {
          arpaymentkey = r.body.id;
          arpaymentkey=parseInt(arpaymentkey);
          payloadApply.arpaymentkey = arpaymentkey;
          payloadApply.arpaymentitems.arpaymentitem.invoicekey = invoiceKey;
        })
        .then(r => cloud.post(`${test.api}/${arpaymentkey}/apply`,payloadApply));
        //.then(r => cloud.delete(`hubs/finance/invoices/${invoiceKey}`)) //Transaction  is already paid and can't be deleted.
      //  .then(r => cloud.delete(`hubs/finance/customers/${customerId}`));//Another area of the system references
    });
  });
