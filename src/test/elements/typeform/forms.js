'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const payload = require('./assets/forms');

suite.forElement('general', 'forms', { payload: payload }, (test) => {
  const opts = {
    churros: {
      updatePayload: {
        "title": "<<random.words>>"
      }
    }
  };
  test.withOptions(opts).should.supportCruds();
  test.should.supportPagination();
  test.withOptions({ qs: { where: 'search=\'typeform\'' } })
    .withName('should support search by filter')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => JSON.stringify(obj).toLowerCase().indexOf('typeform'));
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();

  it(`should allow RU ${test.api}/{formId}/messages`, () => {
    let formId;
    const msgUpdatePayload = { "label.buttonHint.default": "label.buttonHint.default" };
    return cloud.post(`${test.api}`, payload)
      .then(r => formId = r.body.id)
      .then(r => cloud.patch(`${test.api}/${formId}/messages`, msgUpdatePayload))
      .then(r => cloud.get(`${test.api}/${formId}/messages`));
  });
});
