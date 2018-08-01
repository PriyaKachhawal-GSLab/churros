const suite = require('core/suite');
const cloud = require('core/cloud');
const payload = require('./assets/workitems.json');
const updatePayload = require('./assets/workitems-update.json');
var currentdate = new Date();
payload['System.Title'] += currentdate;
updatePayload['System.Description'] += currentdate;
var witId = ``;
suite.forElement('collaboration', 'work-items', { payload: payload }, (test) => {
  it('should allow CRUDS for work-items', () => {
    return cloud.get(`${test.api}`).
    then(r => cloud.withOptions({ qs: { where: `System.Id in (30,31,32)`, orderBy: `System.Title` } }).get(`${test.api}`))
      .then(r => {
        console.log(`✓ Should support CEQL where clause & orderBy`)
      })
      .then(r => cloud.post(`${test.api}`, payload))
      .then(
        r => {
          witId = r.body.Id;
        }
      )
      .then(r => cloud.get(`${test.api}/${witId}`))
      .then(r => cloud.patch(`${test.api}/${witId}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${witId}`))
  })
});