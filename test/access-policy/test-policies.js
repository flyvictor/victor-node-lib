var _ = require("underscore");

module.exports = {
  adminPolicy: {
    name: "adminPolicy",
    predicate: function(req, adminRoles, adminApps){
      return _.any(_.map(req.user.roles, function(role){
        return adminRoles.indexOf(role) !== -1;
      })) && adminApps.indexOf(req.clientApp.authKey) !== -1;
    }
  },
  defaultPolicy: {
    name: "defaultPolicy",
    predicate: function(req, adminRoles, adminApps){
      return true;
    }
  }
};
