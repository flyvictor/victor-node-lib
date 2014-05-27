var _ = require("underscore"),
  requestSigning = require("../request-signing");

var getKey = function(key){
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
  var key = req.query.authKey,
    secret = getKey(key);

  if(!secret){
    console.log("checkKeys: invalid key " + key);
    res.send(401);
  }
  else {
    var hasValidSignature = requestSigning.validateRequest(req, secret);
    console.log("base string for signature", requestSigning.createBaseString(req));
    console.log("requestSigning calculated signature", requestSigning.sign(req, secret));

    if(!hasValidSignature){
      console.error("checkKeys request failed key check, rejecting as HTTP 401");
      res.send(401);
    }
    else next();
  }
};

exports.checkKeys = checkKeys;
exports.getKey = getKey;