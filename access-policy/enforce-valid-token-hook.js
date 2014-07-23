var _ = require("underscore");

var pathExecptionsMatches = function(list, path, method) {
  return _.find(list, function(pattern) {
    return path.match(pattern.path) && (!pattern.method || (method === pattern.method));
  });
};

function enforceValidTokenConstructor(options){
  var securityExceptions = options.secutityExceptions;
  return function enforceValidToken(req, res, next){
    var self = this;
    if (pathExecptionsMatches(securityExceptions, req.path, req.method)) {
      next && next();
      return this;
    } else {
      var token = (req.headers || {}).userauthtoken || (req.query || {}).userAuthToken;

      if(token && !req.user.userId){
        console.log("request has a token but it is invalid");
        res.send(403);
        return false;
      } else {
        next && next();
        return self;
      }
    }
  };
}

exports.enforceValidToken = enforceValidTokenConstructor;

exports.hook = {
  name: 'enforce-valid-token',
  config: {},
  init: enforceValidTokenConstructor
};
