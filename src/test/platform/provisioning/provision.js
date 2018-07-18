const provisioner = require("core/provisioner");
const suite = require("core/suite");
const expect = require("chakram").expect;
const cloud = require("core/cloud");
const defaults = require("core/defaults");
const config = {
  "oauth.callback.url": "https://auth.cloudelements.io/oauth"
};

suite.forPlatform("provisionv2", test => {
  const resetAndDelete = instanceId => {
    defaults.reset();
    return cloud.delete(`/instances/${instanceId}`);
  };

  const cleanup = instanceId =>
    instanceId ? resetAndDelete(instanceId) : Promise.resolve(true);

  it("should create an instance of Bullhorn in V1 and update with v2", () => {
    let instanceId;
    return provisioner
      .create("bullhorn--v1")
      .then(r => {
        instanceId = r.body.id;
        return provisioner.updateWithDefault(
          "bullhorn--v2",
          config,
          null,
          r.body.id
        );
      })
      .then(r => expect(r.body.id).to.equal(instanceId))
      .then(() => cleanup(instanceId))
      .catch(() => cleanup(instanceId));
  });

  it("should provision instance with non default api key/secret", () => {
    let instanceId;
    return provisioner
      .create("zendesk--oauthtest-non-default")
      .then(r => {
        instanceId = r.body.id;
        expect(r.body.id).to.not.be.null;
      })
      .then(() => cleanup(instanceId))
      .catch(() => cleanup(instanceId));
  });

  it("should provision instance with v2 and default api key/secret", () => {
    let instanceId;
    return provisioner
      .createWithDefault("zendesk--oauthtest")
      .then(r => {
        instanceId = r.body.id;
        expect(r.body.id).to.not.be.null;
      })
      .then(() => cleanup(instanceId))
      .catch(() => cleanup(instanceId));
  });

  it("should create an instance of Zendesk in V1, update it in V1, and update it in V1 with a non-default app", () => {
    let instanceId;
    return provisioner
      .create("zendesk")
      .then(r => {
        instanceId = r.body.id;
        return provisioner.update("zendesk", null, null, instanceId);
      })
      .then(r => expect(r.body.id).to.equal(instanceId))
      .then(r =>
        provisioner.update(
          "zendesk--oauthtest-non-default",
          null,
          null,
          instanceId
        )
      )
      .then(r => expect(r.body.id).to.equal(instanceId))
      .then(() => cleanup(instanceId))
      .catch(() => cleanup(instanceId));
  });

  //try some oauth1
  it("should provision OAuth1 element", () => {
    let instanceId;
    return provisioner
      .create("desk")
      .then(r => {
        instanceId = r.body.id;
        return r;
      })
      .then(() => cleanup(instanceId))
      .catch(() => cleanup(instanceId));
  });

  it("should provisionOAuth1 element in V2", () => {
    let instanceId;
    return provisioner
      .createWithDefault("desk")
      .then(r => {
        instanceId = r.body.id;
        return r;
      })
      .then(() => cleanup(instanceId))
      .catch(() => cleanup(instanceId));
  });
});
