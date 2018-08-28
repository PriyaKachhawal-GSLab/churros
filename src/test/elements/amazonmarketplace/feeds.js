const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

suite.forElement('ecommerce', 'feeds', { payload: payload }, (test) => {
    it('should allow SR for feeds status', () => {
        let feedSubmissionId;
        return cloud.get(test.api)
            .then(r => {
                expect(r.body).to.not.be.empty;                
                feedSubmissionId = r.body[0].FeedSubmissionId;
            })
            .then(r => cloud.get(`${test.api}/${feedSubmissionId}`));
    });
});