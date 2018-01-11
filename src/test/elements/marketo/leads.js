'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('marketing', 'programs', (test) => {
  it('should allow R for programs/{id}/leads', () => {
    let program;
    return cloud.get(test.api)
      .then(r => program = r.body[0])
      .then(r => cloud.get(`${test.api}/${program.id}`));
  });
});


