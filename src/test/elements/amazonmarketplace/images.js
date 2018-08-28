const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/images.json`);

suite.forElement('ecommerce', 'images', { payload: payload }, (test) => {

    it('should allow C for images', () => {
        return cloud.post(test.api, payload)
            .then(r => expect(r.body.FeedSubmissionId).to.not.be.null);
    });
});