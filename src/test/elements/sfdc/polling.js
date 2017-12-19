'use strict';

//dependencies at the top
const expect = require('chakram').expect;
const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
//how to import payloads
const accountsPayload = tools.requirePayload(`${__dirname}/assets/accounts.json`);
const contactsPayload = tools.requirePayload(`${__dirname}/assets/contacts.json`);
const leadsPayload = tools.requirePayload(`${__dirname}/assets/leads.json`);
const opportunitiesPayload = tools.requirePayload(`${__dirname}/assets/opportunities.json`);

suite.forElement('crm', 'polling', (test) => {
  test.withApi('/hubs/crm/accounts').should.supportPolling(accountsPayload, 'Account');
  test.withApi('/hubs/crm/contacts').should.supportPolling(contactsPayload, 'Contact');
  test.withApi('/hubs/crm/leads').should.supportPolling(leadsPayload, 'Lead');
  test.withApi('/hubs/crm/opportunities').should.supportPolling(opportunitiesPayload, 'Opportunity');

  it('should delete event poller records for unused objects', () => {
    return cloud.patch('/instances',
      {
        configuration:
          {
            'event.poller.refresh_interval':'1',
            'event.objects':'Contact,Account',
            'event.vendor.type':'polling',
            'event.notification.enabled':'true'
          }
      })
      .then(() => tools.wait.upTo(90000).for(() => cloud.get('/instances/event-poller-records', r => expect(r.body.length).to.equal(2))))
      .then(() => cloud.patch('/instances',{configuration:{'event.objects':'Contact'}}))
      .then(() => cloud.get('/instances/event-poller-records', r => expect(r.body.length).to.equal(1)));
  });
});
