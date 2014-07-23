/**
 * This thing is an init fn for fortune hook that can be used as express filter also
 */
function augmentUserConstructor(hookOptions){
  var validator = hookOptions.validator;
  return function augmentUser(req, res, next){
    var token = (req.headers || {}).userauthtoken || (req.query || {}).userAuthToken;
    var self = this;
    if(token){
      return validator.validate(token)
        .then(function(userData){
          _.extend(req.user, userData, {authenticated: true});
          next && next();
          return self;
        }).catch(function(){
          res.set("Authentication-Warning", "Authentication token incorrect!");
          next && next();
          return self;
        });
    } else {
      next && next();
      return self;
    }
  }
}

exports.augmentUser = augmentUserConstructor;

exports.hook = {
  name: "augment-user",
  priority: 3,
  config: {},
  init: augmentUserConstructor
};
