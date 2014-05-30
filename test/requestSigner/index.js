var requestSigner = require("../../requestSigner"),
	crypto = require("crypto"),
	Rfc3986 = require("../../requestSigner/Rfc3986"),
	_ = require("underscore");

module.exports = function (utils) {
	var expectDifferentHashes = function(firstRequst, changeToRequest, secret){
		var secondRequest = _.clone(firstRequst);
		secondRequest = _.extend(secondRequest, changeToRequest);

		var firstHash = requestSigner.sign(firstRequst, secret);
		var secondHash = requestSigner.sign(secondRequest, secret);
		
		firstHash.should.not.eql(secondHash);
	};

	describe("Securing Auth Secret", function(){
		var request;
		var secret = "3BckWpCNwqSGdD9g*nZDN";

		beforeEach(function(){
			request = {
				headers: {host: "localhost:3012", "x-forwarded-proto": "https"},
				body: {key: "value"},
				method: "POST",
				path: "/sync-something",
				query: {"authKey": "admin-frontend", oauth_signature : "fRTrPesfazKHgEypSfPbIVRa7Js="}
			};
		});

		describe("sign request", function(){
			it("should generate different hashes on a different methods", function(){
				expectDifferentHashes(request, {method: "GET"}, secret);
			});

			it("should generate different hashes on a different paths", function(){
				expectDifferentHashes(request, {path: "/do-something-else"}, secret);
			});

			it("should generate different hashes on a different query string", function(){
				expectDifferentHashes(request, {query: {"authKey": "legacy-system", "some": "value"}}, secret);
			});

			it("should generate different hashes on different protocols", function(){
				expectDifferentHashes(request, {protocol: "http", headers: {host: "localhost:3012"}}, secret);
			});

			it("should generate same hash ignoring authSignature parameter", function(){
				var firstHash = requestSigner.sign(request, secret);
				request.query.oauth_signature = "asdasddsad";
				var secondHash = requestSigner.sign(request, secret);
				
				firstHash.should.eql(secondHash);
			});
		});

		describe("signing key", function(){
			beforeEach(function(){
				utils.testDependencies().sinon.spy(crypto, "createHmac");
			});
			afterEach(function(){
				crypto.createHmac.restore();
			})

			it("should generate a key from secret if no consumerToken", function(){
				requestSigner.validateRequest(request, secret);
				crypto.createHmac.should.have.been.calledWith("sha1", "3BckWpCNwqSGdD9g%2AnZDN&");
			});

			it("should generate a key from secret and consumerToken if there is consumerToken", function(){
				requestSigner.validateRequest(request, secret, "token");
				crypto.createHmac.should.have.been.calledWith("sha1", "3BckWpCNwqSGdD9g%2AnZDN&token");
			});
		});

		describe("validating requests", function(){
			it("should validate a correct signature", function(){
				var isValid = requestSigner.validateRequest(request, "3BckWpCNwqSGdD9g*nZDN");
				isValid.should.eql(true);
			});
		});

		describe("creating base string for encrypting", function(){
			it("should start with the method name", function(){
				var baseString = requestSigner.createBaseString(request);
				baseString.should.match(/^POST&/);
			});

			it("should start with the method name uppercased", function(){
				request.method = "get";
				var baseString = requestSigner.createBaseString(request);
				baseString.should.match(/^GET&/);
			});

			it("should have the base url encoded", function(){
				var baseString = requestSigner.createBaseString(request);
				baseString.should.match(/POST&https%3A%2F%2Flocalhost%3A3012%2Fsync-something&/);
			});


			it("should have the base url encoded", function(){
				var baseString = requestSigner.createBaseString(request);
				baseString.should.match(/POST&https%3A%2F%2Flocalhost%3A3012%2Fsync-something&/);
			});

			it("should not have any (=) sign as they are all encoded to %3D", function(){
				var baseString = requestSigner.createBaseString(request);
				baseString.search(/=/).should.eql(-1);
				baseString.search(/%3D/).should.not.eql(-1);
			});

			it("should have all keys encoded and alphabetically ordered", function(){
				request.query.anotherKey = "anotherValue";
				request.body["ab%c"] = "val ue";
				request.query.zKey = true;

				var baseString = Rfc3986.decode(Rfc3986.decode(requestSigner.createBaseString(request)));
				baseString.should.match(/&ab%c=val ue&anotherKey=anotherValue&authKey=admin-frontend&key=value&zKey=true$/);
			});
		});
		//example in documentaion https://dev.twitter.com/docs/auth/creating-signature
		describe("example from Twitter api documentation", function(){
			var request = {
				protocol: "https",
				headers: {host: "api.twitter.com", "x-forwarded-proto": "https"},
				body: {status: "Hello Ladies + Gentlemen, a signed OAuth request!"},
				method: "POST",
				path: "/1/statuses/update.json",
				query: {
					"include_entities": true,
					"oauth_consumer_key":	"xvz1evFS4wEEPTGEFPHBog",
					"oauth_nonce":	"kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg",
					"oauth_signature_method": "HMAC-SHA1",
					"oauth_timestamp":	1318622958,
					"oauth_token":	"370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb",
					"oauth_version": "1.0"
				}
			};

			var secret = "kAcSOqF21Fu85e7zjz7ZN2U4ZRhfV3WpwPAoE3Z7kBw",
				consumerKey = "LswwdoUaIvS8ltyTt5jkRh4J50vUPVVHtR2YPi5kE";

			it("should create the base string as specified in the twitter docs", function(){
				var baseString = requestSigner.createBaseString(request);
				baseString.should.match(/POST&https%3A%2F%2Fapi.twitter.com%2F1%2Fstatuses%2Fupdate.json&include_entities%3Dtrue/);
				baseString.should.match(/%26oauth_consumer_key%3Dxvz1evFS4wEEPTGEFPHBog/);
				baseString.should.match(/%26oauth_nonce%3DkYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg/);
				baseString.should.match(/%26oauth_signature_method%3DHMAC-SHA1/);
				baseString.should.match(/%26oauth_timestamp%3D1318622958/);
				baseString.should.match(/%26oauth_token%3D370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb/);
				baseString.should.match(/%26oauth_version%3D1.0/);
				baseString.should.match(/%26status%3DHello%2520Ladies%2520%252B%2520Gentlemen%252C%2520a%2520signed%2520OAuth%2520request%2521/);
			});

			it("should create the signature as specified in the twitter docs", function(){
				var signature = requestSigner.sign(request, secret, consumerKey);
				signature.should.eql("tnnArxj06cWHq44gCs1OSKk/jLY=");
			});
		});
	});
};