var _ = require("underscore");
module.exports = {
  policies: require("./defaultPolicies"),
  extendPolicies: function(newPolicies){
    _.extend(this.policies, newPolicies);
  },
  authHooks: [
    _.extend(require("./augment-user-hook").hook, {priority: 100}),
    _.extend(require("./enforce-valid-token-hook").hook, {priority: 90}),
    _.extend(require("./set-access-policies"), {priority: 80}),
    _.extend(require("./restrict-resource-access"), {priority: 70})
  ],
  restrictAccessHooks: [
    require("./restrict-resource-access")
  ],
  setPoliciesHooks: [
    require("./set-access-policies")
  ]
};
