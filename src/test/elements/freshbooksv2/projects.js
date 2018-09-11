'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const createPayload = tools.requirePayload(`${__dirname}/assets/projectsCreate.json`);
const updatePayload = tools.requirePayload(`${__dirname}/assets/projectsUpdate.json`);

suite.forElement('finance', 'projects', { payload: createPayload }, (test) => {

    const opts = {
        churros: {
            updatePayload
        }
    };

    test.withOptions(opts).should.supportCrus();
    test.should.supportPagination();
    test.withApi(test.api)
        .withOptions({ qs: { where: "active='false'" } })
        .withValidation(r => expect(r.body.filter(obj => obj.active === false)).to.not.be.empty)
        .withName('should allow GET with option `active`')
        .should.return200OnGet();
});