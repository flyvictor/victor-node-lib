var _ = require("underscore"),
  requestSigner = require("../requestSigner");

var getKey = function(key){
  if (!key) return false;
  
  var keyPairs = process.env.CLIENT_KEYS || "legacy-application:kfJyFWwUB3ZXNr0KC!vRz$;admin-frontend:3BckWpCNwqSGdD9g*nZDN;";
  var result;
  _.each(keyPairs.split(";"), function(val){
    if(val){
      var pair = val.split(":");
      if(pair[0] === key) result = pair[1];
    }
  });
  return result;
};

var checkKeys = function(req, res, next) {
  if(req.headers && req.headers["internal-request"]){
    console.log("ignoring auth cause it's internal-request");
    next();
  }
  else {
    /*jshint camelcase: false */
    var key = req.clientApp ? req.clientApp.authKey : null,
      sig = req.clientApp ? req.clientApp.oauthSignature : null,
      consumerSecret = getKey(key);

    if(!consumerSecret){
      console.error("checkKeys: invalid key " + key);
      res.send(401);
    }
    else {
      var hasValidSignature = requestSigner.validateRequest(req, sig, consumerSecret, null);

      if(!hasValidSignature){
        console.error("checkKeys request failed key check, rejecting as HTTP 401");
        res.send(401);
      }

      else {
        req.clientApp = req.clientApp || {};
        req.clientApp.authenticated = true;
        next();
      }
    }
  }
};

exports.checkKeys = checkKeys;
exports.getKey = getKey;
