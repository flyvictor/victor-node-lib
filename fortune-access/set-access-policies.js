var _ = require("underscore");

module.exports = {
  name: "set-access-policies",
  config: {
    predicates: [],
    adminRoles: [],
    adminApps: []
  },
  init: function(hookConfig){
    var predicates = hookConfig.predicates;
    var adminRoles = hookConfig.adminRoles;
    var adminApps = hookConfig.adminApps;
    return function(req){
      req.accessPolicies = _.compact(_.map(predicates, function(p, name){
        return p.predicate(req, adminRoles, adminApps) ? p.name : false;
      }));
      return this;
    }
  }
};
