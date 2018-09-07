'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const createPayload = tools.requirePayload(`${__dirname}/assets/employeesCreate.json`);
const updatePayload = tools.requirePayload(`${__dirname}/assets/employeesUpdate.json`);

suite.forElement('finance', 'employees', { payload: createPayload }, (test) => {

    const opts = {
        churros: {
            updatePayload
        }
    };

    test.withOptions(opts).should.supportCruds();
    test.should.supportPagination();
    test.withApi(test.api)
        .withOptions({ qs: { where: "email_like='.com'" } })
        .withValidation(r => expect(r.body.filter(obj => obj.email.endsWith('.com'))).to.not.be.empty)
        .withName('should allow GET with option `email_like`')
        .should.return200OnGet();
});