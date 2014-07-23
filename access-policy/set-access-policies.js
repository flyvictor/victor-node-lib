var _ = require("underscore");
var adminApps = (process.env.ADMIN_APPS || "admin-frontend,legacy-application").split(",");
var adminRoles = (process.env.ADMIN_USER_ROLES || "Administrators,OpsAdmin").split(",");

module.exports = {
  name: "set-access-policies",
  config: {
    predicates: [],
    adminRoles: adminRoles,
    adminApps: adminApps
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
