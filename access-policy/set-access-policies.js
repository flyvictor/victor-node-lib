var _ = require("underscore");
var adminApps = (process.env.ADMIN_APPS || "admin-frontend,legacy-application").split(",");
var adminRoles = (process.env.ADMIN_USER_ROLES || "Administrators,OpsAdmin").split(",");

function getUserLevel(req, adminRoles, adminApps){
  var roles = req.user.roles;
  return _.max(_.map(roles, function(role){
    return adminRoles.indexOf(role) === -1 ? 0 : 1;
  }));
}

function getAppLevel(req, adminRoles, adminApps){
  var app = req.clientApp.authKey;
  return adminApps.indexOf(app) === -1 ? 0 : 1;
}

function defaultSetter(levels, req){
  if (_.min(levels) === 1){
    req.accessPolicies.push("readAllPolicy")
  }else{
    req.accessPolicies.push("readMyPolicy");
  }
}

module.exports = {
  name: "set-access-policies",
  priority: 100,
  config: {
    predicates: [getUserLevel, getAppLevel],
    adminRoles: adminRoles,
    adminApps: adminApps,
    rolesSetter: defaultSetter
  },
  init: function(hookConfig){
    var policies = hookConfig.policies;
    var predicates = hookConfig.predicates;
    var adminRoles = hookConfig.adminRoles;
    var adminApps = hookConfig.adminApps;
    var setter = hookConfig.rolesSetter;
    return function(req){
      req.accessPolicies = ["defaultPolicy"];
      var levels = _.map(predicates, function(p){
        return p(req, adminRoles, adminApps);
      });
      //Match app key and user role to configured policies
      setter(levels, req);
      return this;
    }
  }
};
