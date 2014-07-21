var _ = require("underscore");
module.exports = {
  policies: require("./defaultPolicies"),
  extendPolicies: function(newPolicies){
    _.extend(this.policies, newPolicies);
  },
  restrictAccessHooks: [
    require("./restrict-resource-access")
  ],
  setPoliciesHooks: [
    require("./set-access-policies")
  ]
};
