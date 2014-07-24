var _ = require("underscore");
var setAccessPolicies = require("./set-access-policies");
var restrictResourceAccess = require("./restrict-resource-access");


function FortuneAccess(policies, adminRoles, adminApps){
  this._policies = policies;
  this._adminRoles = adminRoles;
  this._adminApps = adminApps;
  this._middleware = [];
  this._hooks = [];
  this._priority = 100;
}

FortuneAccess.prototype.init = function(apps){
  _.each(apps, this._applyPolicy);
};

FortuneAccess.prototype.useC = function(fn){
  this._middleware.push(fn.apply(null, _.toArray(arguments).slice(1)));
  return this;
};

FortuneAccess.prototype.setupHttpFilters = function(express){
  //Attach configured http security filters to the app.
  _.each(this._middleware, function(mw){
    express.use(mw);
  });

  //Intercept calls to /resources
  express.use(function(req, res, next){
    if (req.url !== '/resources') return next();
    //TODO: something with that
    next();
  });
  return this;
};

/**
 * Consumes function that will extend request in some way
 * Should require no additional config
 */
FortuneAccess.prototype.setReqAugmentors = function(augmentors){
  var self = this;
  this._hooks.concat(_.map(augmentors, function(constructor){
    _.extend(constructor, {priority: self._priority--});
  }));

  return this;
};

FortuneAccess.prototype._applyPolicy = function(app){
  //Read each resource policy
  var policies = app.policy;
  //Attach validation hooks
  this._setupHooks(app, policies);
};

FortuneAccess.prototype._setupHooks = function(app, policies){
  var self = this;

  //TODO: extend fortune to provide public .eachResource method
  _.each(app._resources, function(resource, name){
    var predicates = self._getPredicates(policies);
    app.beforeRW(name, [_.extend(setAccessPolicies, {priority: self._priority--})], {
      predicates: predicates,
      adminRoles: self._adminRoles,
      adminApps: self._adminApps
    });

    app.beforeRW(name, [_.extend(restrictResourceAccess, {priority: self._priority--})], {
      policies: app.policy
    });
  });
};

FortuneAccess.prototype._getPredicates = function(resource){
  var policies = Object.keys(resource.policy || {});
  return _.pick.apply(null, [this._policies].concat(policies));
};


module.exports = function(policies, adminRoles, adminApps){
  return new FortuneAccess(policies, adminRoles, adminApps);
};

