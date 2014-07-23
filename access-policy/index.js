var _ = require("underscore");
var when = require("when");

var policies = require("./policies");

var _credentialsParser = require("../filters/credentialsParser");
var credentialsParserHook = {
  name: "credentialsParser",
  init: function(){
    return function(req, res){
      var d = when.defer();
      var self = this;
      _credentialsParser(req, res, function(){
        d.resolve(self);
      });
      return d.promise;
    }
  }
};

module.exports = {
  policies: policies,
  setPolicies: function(policies){
    this.policies = policies;
  },
  authHooks: [
    _.extend(credentialsParserHook, {priority: 100}),
    _.extend(require("./augment-user-hook").hook, {priority: 90}),
    _.extend(require("./set-access-policies"), {priority: 80}),
    _.extend(require("./restrict-resource-access"), {priority: 70})
  ],
  augmentUser: require("./augment-user-hook").augmentUser,
  enforceValidToken: require("./enforce-valid-token-hook").enforceValidToken
};
