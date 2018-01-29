const provisioner = require('core/provisioner');
const suite = require('core/suite');
const expect = require('chakram').expect;
const cloud = require('core/cloud');
let config = {
  "oauth.callback.url":"https://auth.cloudelements.io/oauth"
};

suite.forPlatform('provisionv2', (test) => {
  let oauth2instanceId, oauth2instanceId2, oauth2instanceId3, oauth2instanceId4, oauth1instanceId, oauth1instanceId2;

  after(() => {
    return cloud.delete(`instances/${oauth2instanceId}`)
    .then(r => cloud.delete(`instances/${oauth2instanceId2}`))
    .then(r => cloud.delete(`instances/${oauth2instanceId3}`))
    .then(r => cloud.delete(`instances/${oauth2instanceId4}`))
    .then(r => cloud.delete(`instances/${oauth1instanceId}`))
    .then(r => cloud.delete(`instances/${oauth1instanceId2}`));

  });

   it('should create an instance of Bullhorn in V1 and update with v2', () => {
     return provisioner.create('bullhorn--v1')
     .then(r => {
       oauth2instanceId = r.body.id;
       return provisioner.updateWithDefault('bullhorn--v2', config, null, r.body.id);
     })
    .then(r => expect(r.body.id).to.equal(oauth2instanceId));
   });


   it('should create an instance of Bullhorn in V1 and update with v2 when config is masked', () => {
     return provisioner.create('bullhorn--v1')
     .then(r => {
       oauth2instanceId = r.body.id;
       return provisioner.updateWithDefault('bullhorn--v2masked', null, null, r.body.id);
     })
    .then(r => expect(r.body.id).to.equal(oauth2instanceId));
   });

  it('should provision instance with non default api key/secret', () => {
   return provisioner.create('zendesk--oauthtest-non-default')
   .then(r => {
     oauth2instanceId3 = r.body.id;
     return r;
   })
   .then(r => expect(r.body.id).to.not.be.null);
  });

  it('should provision instance with v2 and default api key/secret', () => {
   return provisioner.createWithDefault('zendesk--oauthtest')
   .then(r => {
     oauth2instanceId4 = r.body.id;
     return r;
   })
   .then(r => expect(r.body.id).to.not.be.null);
  });

  it('should create an instance of Zendesk in V1, update it in V1, and update it in V1 with a non-default app', () => {
    return provisioner.create('zendesk')
    .then(r => {
      oauth2instanceId2 = r.body.id;
      return provisioner.update('zendesk', null, null, oauth2instanceId2);
    })
   .then(r => expect(r.body.id).to.equal(oauth2instanceId2))
   .then(r => provisioner.update('zendesk--oauthtest-non-default', null, null, oauth2instanceId2))
   .then(r => expect(r.body.id).to.equal(oauth2instanceId2));
 });

  //try some oauth1

  it('should provision OAuth1 element', () => provisioner.create('desk')
  .then(r => {
    oauth1instanceId = r.body.id;
    return r;
  }));

  it('should provisionOAuth1 element in V2', () => provisioner.createWithDefault('desk')
  .then(r => {
    oauth1instanceId2 = r.body.id;
    return r;
  }));

});
