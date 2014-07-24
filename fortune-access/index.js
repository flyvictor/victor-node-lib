var _ = require("underscore");
var setAccessPolicies = require("./set-access-policies");
var restrictResourceAccess = require("./restrict-resource-access");


function FortuneAccess(policies, adminRoles, adminApps){
  _.each(policies, this._validatePolicy);
  this._policies = policies;
  this._adminRoles = adminRoles || [];
  this._adminApps = adminApps || [];
  this._middleware = [];
  this._priority = 100;
}

FortuneAccess.prototype.init = function(apps){
  _.each(apps, this._setupHooks);
};

FortuneAccess.prototype.useC = function(fn){
  this._middleware.push(fn.apply(null, _.toArray(arguments).slice(1)));
  return this;
};
FortuneAccess.prototype.use = function(fn){
  this._middleware.push(fn);
  return this;
};

FortuneAccess.prototype.setupHttpFilters = function(express){
  //Attach configured http security filters to the app.
  _.each(this._middleware, function(mw){
    express.use(mw);
  });
  return this;
};

FortuneAccess.prototype._validatePolicy = function(policy){
  var valid = true;

  if(!existy(policy, "name") || !existy(policy, "predicate")) valid = false;
  if(!_.isFunction(policy.predicate)) valid = false;

  if (!valid) throw new Error("Policy " + policy.name +" is invalid");

  function existy(obj, prop){
    return !_.isUndefined(obj[prop]) && !_.isNull(obj[prop]);
  }
};

FortuneAccess.prototype._setupHooks = function(app){
  var self = this;

  //TODO: extend fortune to provide public .eachResource method
  _.each(app._resources, function(resource, name){
    var predicates = self._getPredicates(resource);
    app.beforeRW(name, [
      _.extend(setAccessPolicies, {priority: self._priority--}),
      _.extend(restrictResourceAccess, {priority: self._priority--})
    ], {
      "set-access-policies": {
        predicates: predicates,
        adminRoles: self._adminRoles,
        adminApps: self._adminApps
      },
      "restrict-resource-access": {
        policies: resource.policy
      }
    });
  });
};

FortuneAccess.prototype._getPredicates = function(resource){
  var policies = Object.keys(resource.policy || {});
  return _.filter(this._policies, function(p){
    return policies.indexOf(p.name) !== -1;
  });
};


module.exports = function(policies, adminRoles, adminApps){
  return new FortuneAccess(policies, adminRoles, adminApps);
};

