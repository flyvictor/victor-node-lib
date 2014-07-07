var crypto = require("crypto"),
	Rfc3986 = require("./Rfc3986"),
	_ = require("underscore");



//Detailed description of this functionality can be found on: https://dev.twitter.com/docs/auth/creating-signature
var createBaseString = function(request) {
	//1. Collect the parameters from query string and Body
	var params = {},
		encodedParams = {};

	if(request.method === "GET") {
		var url = require("url");
		var urlParts = url.parse(request.url, true);
		var query = urlParts.query;
		params = _.extend(params, query);
	}

	if(request.method === "POST" && request.headers["content-type"] === "application/x-www-form-urlencoded"){
		params = _.extend(params, request.body);
	}

	if(request.headers.authorization){
		params = _.extend(params, request.oAuthHeaders);
	}


	//2. enocde each key and value
	_.each(params, function(val, key){
		//authSignature is the actual signature to compare against, it should be ignored in the base string
		if(key!== "oauth_signature"){
			encodedParams[Rfc3986.encode(key)] = Rfc3986.encode(val);
		}
	});

	//3. Sort the encoded keys alphabetically
	var sortedKeys = _.keys(encodedParams).sort();

	//4. foreach key/value, change it to key=val
	var baseParams = _.map(sortedKeys, function(key){
		return key + "=" + encodedParams[key];
	});

	var protocol = (request.headers["x-forwarded-proto"] === "https")? "https": request.protocol;

	var baseParamsString = baseParams.join("&"),
		method = request.method || "",
		baseUrl = protocol + "://" + request.headers.host + request.path;

	var baseString =  method.toUpperCase() + "&" + Rfc3986.encode(baseUrl)+ "&" + Rfc3986.encode(baseParamsString);
	 console.log("base string for signature", baseString);
	return baseString;
};

var signRequest = function(request, consumerSecret, oAuthTokenSecret){
	//signing key should encoded consumerSecret & encoded oAuthTokenSecret (which we don't have now but just adding it to make consistent with api docs)
	var signingKey = Rfc3986.encode(consumerSecret) + "&";
	if(oAuthTokenSecret)
		signingKey += Rfc3986.encode(oAuthTokenSecret);

	var hmac = crypto.createHmac("sha1", signingKey);
	var baseString = createBaseString(request);
	hmac.update(baseString);
	var signature = hmac.digest("base64");

  // console.log("requestSigning calculated signature", signature);
	return signature;
};

var validateRequest = function(request, signature, consumerSecret, oAuthTokenSecret){
	/*jshint camelcase: false */
	var expectedSignature = signRequest(request, consumerSecret, oAuthTokenSecret);
	 console.log("validate request, expected signature : %s, passed signature: %s", expectedSignature, signature);
	return expectedSignature === Rfc3986.decode(signature);
};

module.exports.createBaseString = createBaseString;
module.exports.sign = signRequest;

module.exports.validateRequest = validateRequest;