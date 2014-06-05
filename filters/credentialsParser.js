var _ = require("underscore");

var credentialsParser = function(req, res, next) {
  
  req.clientApp = {
  	/*jshint camelcase: false*/
    authKey : (req.query || {}).authKey || (req.headers||{}).authkey || (req.body||{}).authKey,
    oauthSignature : (req.query||{}).oauth_signature || (req.headers||{}).oauth_signature || (req.body || {}).oauth_signature
  };

  req.user = {
    authToken : _.result(req.headers, "userauthtoken") || _.result(req.query, "userAuthToken")
  };

  next();
};

module.exports = credentialsParser;