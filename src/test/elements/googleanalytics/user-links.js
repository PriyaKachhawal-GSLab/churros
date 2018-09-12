'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const chakram = require('chakram');
const cloud = require('core/cloud');
const expect = chakram.expect;

const payload = tools.requirePayload(`${__dirname}/assets/user_links_payload.json`);

suite.forElement('general', 'user-links', {payload: payload}, (test) => {
	it('should allow CRUDS for /user-links', () => {
        let userLinksId = -1;
        return cloud.post(`${test.api}`, payload)
            .then(r => userLinksId = r.body.id)
            .then(r => cloud.put(`${test.api}/${userLinksId}`, payload))
            .then(r => cloud.get(`${test.api}`))
            .then(r => expect(r.body.length).to.not.be.empty)
            .then(r => cloud.delete(`${test.api}/${userLinksId}`));
    });
    test.should.supportPagination();
})