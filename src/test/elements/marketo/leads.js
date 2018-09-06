'use strict';

const suite = require('core/suite');
const chakram = require('chakram');
const expect = chakram.expect;
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/leads-create.json`);
const updatedPayload = tools.requirePayload(`${__dirname}/assets/leads-update.json`);
const interactionPayload = tools.requirePayload(`${__dirname}/assets/interactions-create.json`);

suite.forElement('marketing', 'leads', { payload: payload }, (test) => {
  it('should allow CRUDS for /leads', () => {
    let id;
    return cloud.post(test.api, payload)
      .then(r => id = r.body.person.id)
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => cloud.patch(`${test.api}/${id}`, updatedPayload))
      .then(r => cloud.withOptions({ qs: { where: `id in ( ${id} )` } }).get(test.api))
      .then(r => expect(r.body).to.have.lengthOf(1) && expect(r.body[0].person.id).to.equal(id))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
  it('should allow POST /leads/:id/merge and POST /leads/:id/interactions', () => {
    let id, id2;
    return cloud.post(test.api, payload)
      .then(r => id = r.body.person.id)
      .then(r => cloud.post(`${test.api}/${id}/interactions`, interactionPayload))
      .then(r => cloud.post(test.api, updatedPayload))
      .then(r => id2 = r.body.person.id)
      .then(r => cloud.post(`${test.api}/${id}/merge`, { leadIds: [id2] }))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
});
