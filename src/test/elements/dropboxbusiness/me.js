'use strict';

const suite = require('core/suite');
const props = require('core/props');

suite.forElement('documents', 'me', (test) => {
  let memberId = props.getForKey('dropboxbusiness', 'username');
  test.withOptions({ headers: { "Elements-As-Team-Member": memberId } }).should.supportS();
});
