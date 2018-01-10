'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/contacts.json`);
const updatedPayload = tools.requirePayload(`${__dirname}/assets/contacts.json`);
const interactionPayload = {
  "id": tools.randomInt(),
  "token": tools.randomInt()
};

suite.forElement('marketing', 'contacts', { payload: payload }, (test) => {
  it('should allow CRUDS for /contacts', () => {
    let id;
    return cloud.post(test.api, payload)
      .then(r => id = r.body.person.id)
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => cloud.patch(`${test.api}/${id}`, updatedPayload))
      .then(r => cloud.withOptions({ qs: { where: `id in ( ${id} )` } }).get(test.api))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });

  it('should allow POST /contacts/:id/merge and POST /contacts/:id/interactions', () => {
    let id, id2;
    return cloud.post(test.api, payload)
      .then(r => id = r.body.person.id)
      .then(r => cloud.post(`${test.api}/${id}/interactions`, interactionPayload))
      .then(r => cloud.post(test.api, updatedPayload))
      .then(r => id2 = r.body.person.id)
      .then(r => cloud.post(`${test.api}/${id}/merge`, { leadIds: [id2] }))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });

  test
    .withApi('/changed-contacts')
    .withName('should support sinceDate query on GET /changed-contacts')
    .withOptions({ qs: { where: `sinceDate = '2016-11-25T11:39:58Z'` } })
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.activityDate >= '2016-11-25T11:39:58Z');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();

  test
    .withApi('/deleted-contacts')
    .withName('should support sinceDate query on GET /deleted-contacts')
    .withOptions({ qs: { where: `sinceDate = '2016-11-25T11:39:58Z'` } })
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.activityDate >= '2016-11-25T11:39:58Z');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
});
