const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
suite.forElement('finance', 'job-types', (test) => {
    it(`should support RS for ${test.api}`, () => {
        let id;
        return cloud.get(test.api)
          .then(r => id = r.body[0].ListID)
          .then(r => cloud.get(`${test.api}/${id}`));
      });
});