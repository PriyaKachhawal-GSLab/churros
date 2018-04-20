'use strict';

const suite = require('core/suite');
const payload = require('./assets/incidents');
const commentsPayload = require('./assets/comments');
const cloud = require('core/cloud');


suite.forElement('crm', 'incidents', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.withOptions({ qs: { where: 'summary=\'Sample API Posted Issue From Churros\'' } }).should.return200OnGet();
  test.should.supportPagination('id');

  it('should allow CRUS for /hubs/crm/incidents/{id}/comments', () => {
    let incidentId = -1;
    let commentsId = -1;
    return cloud.post(test.api, payload)
      .then(r => incidentId = r.body.id)
      .then(r => cloud.put(`${test.api}/${incidentId}/comments`, commentsPayload))
      .then(r => commentsId = r.body.id)
      .then(r => cloud.get(`${test.api}/${incidentId}/comments`))
      .then(r => cloud.get(`${test.api}/${incidentId}/comments/${commentsId}`))
      .then(r => cloud.patch(`${test.api}/${incidentId}/comments/${commentsId}`, {noteText: 'Hey, I am Churros, have fun', isPartOfResolution: true}))
      .then(r => cloud.delete(`${test.api}/${incidentId}`));
  });
});
