'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');


var channelName;

suite.forElement('marketing', 'channels', (test) => {
  it('should allow SR for /channels', () => {
    return cloud.get(test.api)
    .then(r => channelName = r.body[0].name);
  });

  test.withApi(test.api)
    .withOptions({ qs: { where: `name='${channelName}'` } 
  });
});
