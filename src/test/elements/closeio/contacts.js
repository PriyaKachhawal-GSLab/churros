'use strict';

const tools = require('core/tools');
const suite = require('core/suite');
const cloud = require('core/cloud');

const gen = (opts) => {
  opts = opts ? opts : {};
  const random = tools.random();
  return new Object({
    lead_id: (opts.lead_id) || 'lead_' + random,
    name: (opts.name || 'mr. churros ' + random),
    officeEmail: (opts.officeEmail || 'churros@churros.com')
  });
};

suite.forElement('crm', 'contacts', { payload: gen() }, (test) => {
  it('should allow CRUDS for ' + test.api, () => {
    let accountId;
    return cloud.post('/hubs/crm/accounts', { name: 'churros tmp account' })
      .then(r => accountId = r.body.id)
      .then(r => cloud.cruds(test.api, gen({ lead_id: accountId })))
      .then(r => cloud.delete('/hubs/crm/accounts/' + accountId));
  });
  it('created', () => {
    return cloud.post('/hubs/crm/accounts', { name: 'churros tmp account' })
      .then(r => r.body.id)
      .then(r => cloud.post(test.api, gen({ lead_id: r })))
  })

  test.should.supportPagination();
  test.should.return404OnGet(-1);
  test.should.return404OnPatch(-1);
  test.withOptions({ skip: true }).should.return400OnPost();
  test.withJson({}).should.return400OnPost();
});
