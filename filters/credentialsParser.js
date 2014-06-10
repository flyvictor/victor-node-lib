var _ = require("underscore");

var getOAuthHeaders = function(request){
	if(!request.headers ||!request.headers.authorization)
		return;

	var authHeader = request.headers.authorization;
	var result = {};
	_.each(authHeader.replace(/^OAuth/, "").split(/[, ]/), function(val){
	    if(val){
	      var pair = val.split("=");
	      if(pair[0].search(/^oauth_/) === 0){
	      	result[pair[0]] = pair[1].replace(/"/g, "");
	      }
	    }
	  });

	return result;

};

var credentialsParser = function(req, res, next) {
  
  req.oAuthHeaders = getOAuthHeaders(req) || {};

  req.clientApp = {
  	/*jshint camelcase: false*/
    authKey : (req.query || {}).authKey || (req.headers||{}).authKey || (req.body||{}).authKey,
    oauthSignature : (req.query||{}).oauth_signature || (req.headers||{}).oauth_signature || (req.body || {}).oauth_signature || req.oAuthHeaders.oauth_signature
  };  

  req.user = {
    authToken : _.result(req.headers, "userauthtoken") || _.result(req.query, "userAuthToken")
  };

  next();
};

module.exports = credentialsParser;