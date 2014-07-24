var _ = require("underscore");

function augmentUserConstructor(hookOptions){
  var validator = hookOptions.validator;
  return function augmentUser(req, res){
    var token = (req.headers || {}).userauthtoken || (req.query || {}).userAuthToken;
    var self = this;
    if(token){
      return validator.validate(token)
        .then(function(userData){
          _.extend(req.user, userData, {authenticated: true});
          return self;
        }).catch(function(){
          res.set("Authentication-Warning", "Authentication token incorrect!");
          return self;
        });
    } else {
      return self;
    }
  }
}

exports.createExpressMiddleware = function(hookOptions){
  var fn = augmentUserConstructor(hookOptions);
  return function(req, res, next){
    var returns = fn.call(null, req, res);
    !_.isNull(returns) && returns.then ? returns.then(next) : next();
  }
};

exports.augmentUser = augmentUserConstructor;

exports.hook = {
  name: "augment-user",
  config: {},
  init: augmentUserConstructor
};
