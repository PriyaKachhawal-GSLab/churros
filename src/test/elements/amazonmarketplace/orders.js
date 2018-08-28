const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

suite.forElement('ecommerce', 'orders', (test) => {
    var options = {
        qs: { where: 'CreatedAfter=\'2016-03-16T14:32:16.50-07\'' }
    };

    it('should allow SR for orders', () => {
        let orderId;
        return cloud.withOptions(options).get(test.api)
            .then(r => {
                expect(r.body[0].AmazonOrderId).to.not.be.null;
                orderId = r.body[0].AmazonOrderId;
            })
            .then(r => cloud.get(`${test.api}/${orderId}`))
            .then(r => cloud.get(`${test.api}/${orderId}/products`))
            .then(r => expect(r.body).to.not.be.empty)
            .then(r => cloud.get(`${test.api}/${orderId}/transactions`))
            .then(r => expect(r.body).to.not.be.empty);
    });
});