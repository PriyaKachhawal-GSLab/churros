'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const expect = require('chakram').expect;
const faker = require('faker');
const payload = tools.requirePayload(`${__dirname}/assets/timeline-event-types-create.json`);
const updatePayload = tools.requirePayload(`${__dirname}/assets/timeline-event-types-update.json`);
const propertiesPayload = tools.requirePayload(`${__dirname}/assets/timeline-event-typesProperties-create.json`);
const eventsPayload = tools.requirePayload(`${__dirname}/assets/timeline-event-typesEvents-create.json`);

suite.forElement('crm', 'timeline-event-types', {payload: payload}, (test) => {

    test.should.supportPagination("id");

    it('should support CUDS for /hubs/crm/timeline-event-types', () => {
      let createdId = null;
      return cloud.post(test.api, payload)
        .then(r => createdId = r.body.id)
        .then(() => cloud.patch(`${test.api}/${createdId}`, updatePayload))
        .then(() => cloud.delete(`${test.api}/${createdId}`))
        .then(() => cloud.get(test.api));
    });

  const eventTypesWrap = (cb) => {
     let eventTypes;
     return cloud.post(`${test.api}`, payload)
       .then(r => eventTypes = r.body)
       .then(r => cb(eventTypes))
       .then(r => cloud.delete(`${test.api}/${eventTypes.id}`));
   };

   it('it should allow CUD for /timeline-event-types/:id/properties', () => {
     const cb = (eventTypes) => {
       let eventProperties;
       return cloud.post(`${test.api}/${eventTypes.id}/properties`,propertiesPayload)
         .then(r => {
             expect(r.body).to.contain.key('name');
             eventProperties = r.body;
             eventProperties.label = faker.random.word();
         })
         .then(r => cloud.patch(`${test.api}/${eventTypes.id}/properties/${eventProperties.id}`,eventProperties))
         .then(r => expect(r.body).to.contain.key('label'))
         .then(r => cloud.delete(`${test.api}/${eventTypes.id}/properties/${eventProperties.id}`));
     };
     return eventTypesWrap(cb);
   });

   it('it should allow CRU for /timeline-event-types/:id/events', () => {
     const cb = (eventTypes) => {
       let events;
       return cloud.post(`${test.api}/${eventTypes.id}/events`,eventsPayload)
         .then(r => expect(r.body).to.be.empty)
         .then(r => cloud.get(`${test.api}/${eventTypes.id}/events/${eventsPayload.id}`))
         .then(r => {
                    expect(r.body).to.contain.key('email');
                    expect(r.body).to.have.property('id', `${eventsPayload.id}`);
                    events = r.body;
                    events.email = faker.internet.email();
                  })
        .then(r => cloud.patch(`${test.api}/${eventTypes.id}/events/${eventsPayload.id}`,events))
        .then(r => expect(r.body).to.be.empty);
     };
     return eventTypesWrap(cb);
   });

});
