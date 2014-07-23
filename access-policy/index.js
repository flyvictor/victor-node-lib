var _ = require("underscore");

var policies = require("./policies");

module.exports = {
  authHooks: [
    _.extend(require("./augment-user-hook").hook, {priority: 100}),
    _.extend(require("./enforce-valid-token-hook").hook, {priority: 90}),
    _.extend(require("./set-access-policies"), {priority: 80}),
    _.extend(require("./restrict-resource-access"), {priority: 70})
  ],
  policies: policies,
  setPolicies: function(policies){
    this.policies = policies;
  }
};
