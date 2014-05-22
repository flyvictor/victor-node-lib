var crypto = require("crypto"),
	Rfc3986 = require("./Rfc3986"),
	_ = require("underscore");

//Detailed description of this functionality can be found on: https://dev.twitter.com/docs/auth/creating-signature
var createBaseString = function(request){
	//1. Collect the parameters from query string and Body
	var params = _.extend(request.query, request.body), 
		encodedParams = {};

	//2. enocde each key and value
	_.each(params, function(val, key){
		//authSignature is the actual signature to compare against, it should be ignored in the base string
		if(key!== "authSignature"){ 
			encodedParams[Rfc3986.encode(key)] = Rfc3986.encode(val);
		}
	});

	//3. Sort the encoded keys alphabetically
	var sortedKeys = _.keys(encodedParams).sort();

	//4. foreach key/value, change it to key=val
	var baseParams = _.map(sortedKeys, function(key){
		return key + "=" + encodedParams[key];
	});

	var baseParamsString = baseParams.join("&"),
		method = request.method || "",
		baseUrl = request.protocol + "://" + request.headers.host + request.path;

	return  method.toUpperCase() + "&" + Rfc3986.encode(baseUrl)+ "&" + Rfc3986.encode(baseParamsString);
};

var signRequest = function(request, secretKey){
	var hmac = crypto.createHmac("sha1", secretKey);
	var baseString = createBaseString(request);
	hmac.update(baseString);
	return hmac.digest("base64");
};

var validateRequest = function(request, secretKey){
	var expectedSignature = signRequest(request, secretKey);
	return expectedSignature === Rfc3986.decode(request.query.authSignature);
};

module.exports.createBaseString = createBaseString;
module.exports.sign = signRequest;

module.exports.validateRequest = validateRequest;