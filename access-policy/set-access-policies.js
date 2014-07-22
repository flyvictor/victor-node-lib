var _ = require("underscore");
var policies = require("./index").policies;
var adminApps = (process.env.ADMIN_APPS || "admin-frontend,legacy-application").split(",");
var adminRoles = (process.env.ADMIN_USER_ROLES || "Administrators,OpsAdmin").split(",");

function getUserLevel(roles){
  return _.max(_.map(roles, function(role){
    return adminRoles.indexOf(role) === -1 ? 0 : 1;
  }));
}

function getAppLevel(app){
  return adminApps.indexOf(app) === -1 ? 0 : 1;
}

module.exports = {
  name: "set-access-policies",
  priority: 100,
  init: function(){
    return function(req){
      req.accessPolicies = ["defaultPolicy"];
      var levels = [
        //Inspect req.user and req.clientApp;
        getUserLevel(req.user && req.user.roles),
        getAppLevel(req.clientApp && req.clientApp.authKey)
      ];
      //Match app key and user role to configured policies
      if (_.min(levels) === 1){
        req.accessPolicies.push("readAllPolicy")
      }else{
        req.accessPolicies.push("readMyPolicy");
      }
      return this;
    }
  }
};
