'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('finance', 'hooks', { payload: null }, (test) => {
    test.should.return200OnGet();
    test.should.supportPagination();
    let hId;
    it('should support SD for hooks', () => {
        return cloud.get(test.api)
            .then(r => hId = r.body[0].id)
            .then(r => cloud.delete(`${test.api}/${hId}`));
    });
});