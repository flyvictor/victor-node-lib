var credentialsParser = require("../../filters/credentialsParser"),
    sinon = require("sinon");

module.exports = function() {

  describe("credentialsParser filter", function(){

    var req, res, next;

    beforeEach(function(){
      req = {
      };

      res = {
        send: sinon.stub()
      };

      next = sinon.spy();
    });

    it("should work with authKey in querystring", function(){

      req.query = { authKey : "admin-frontend" };
      
      credentialsParser(req, res, next);
      next.callCount.should.eql(1);
      req.clientApp.authKey.should.eql("admin-frontend");
    });
  
    it("should work with authKey in header (lowercased)", function(){
      req.headers = { authkey : "admin-frontend" };
      credentialsParser(req, res, next);
      next.callCount.should.eql(1);
      req.clientApp.authKey.should.eql("admin-frontend");
    });
  
    it("should work with authKey in body", function(){
      req.body = { authKey : "admin-frontend" };
      credentialsParser(req, res, next);
      next.callCount.should.eql(1);
      req.clientApp.authKey.should.eql("admin-frontend");
    });
  
    it("should work with signature in querystring", function(){
      /*jshint camelcase: false*/
      req.query = { oauth_signature : "fRTrPesfazKHgEypSfPbIVRa7Js=" };
      credentialsParser(req, res, next);
      next.callCount.should.eql(1);
      req.clientApp.oauthSignature.should.eql("fRTrPesfazKHgEypSfPbIVRa7Js=");
    });
  
    it("should work with signature in header", function(){
      /*jshint camelcase: false*/
      req.headers = { oauth_signature : "fRTrPesfazKHgEypSfPbIVRa7Js=" };
      credentialsParser(req, res, next);
      next.callCount.should.eql(1);
      req.clientApp.oauthSignature.should.eql("fRTrPesfazKHgEypSfPbIVRa7Js=");
    });

    it("should work with signature in body", function(){
      /*jshint camelcase: false*/
      req.body = { oauth_signature : "fRTrPesfazKHgEypSfPbIVRa7Js=" };
      credentialsParser(req, res, next);
      next.callCount.should.eql(1);
      req.clientApp.oauthSignature.should.eql("fRTrPesfazKHgEypSfPbIVRa7Js=");
    });

    describe("parsing authorization header", function(){
      //from the example of the oauth specs: http://tools.ietf.org/html/rfc5849#section-3.5
      beforeEach(function(){
        /*jshint quotmark: false*/
        req.headers = { authorization : 'OAuth realm="Example", oauth_consumer_key="admin-frontend", ' + 
          'oauth_token="ad180jjd733klru7", oauth_signature_method="HMAC-SHA1", ' +
          'oauth_signature="wOJIO9A2W5mFwDgiDvZbTSMK%2FPY%3D", oauth_timestamp="137131200",' +
          'oauth_nonce="4572616e48616d6d65724c61686176", oauth_version="1.0"' 
        };
      });

      it("should grab authKey and signature correctly in header", function(){
        credentialsParser(req, res, next);
        next.callCount.should.eql(1);
        req.clientApp.authKey.should.eql("admin-frontend");
        req.clientApp.oauthSignature.should.eql("wOJIO9A2W5mFwDgiDvZbTSMK%2FPY%3D");
      });

      it("should get oauth parameters from authorization header", function(){
        credentialsParser(req, res, next);
        next.callCount.should.eql(1);
        /*jshint camelcase: false*/

        req.oAuthHeaders.oauth_consumer_key.should.eql("admin-frontend");
        req.oAuthHeaders.oauth_token.should.eql("ad180jjd733klru7");
        req.oAuthHeaders.oauth_signature_method.should.eql("HMAC-SHA1");
        req.oAuthHeaders.oauth_signature.should.eql("wOJIO9A2W5mFwDgiDvZbTSMK%2FPY%3D");
        req.oAuthHeaders.oauth_timestamp.should.eql("137131200");
        req.oAuthHeaders.oauth_nonce.should.eql("4572616e48616d6d65724c61686176");
        req.oAuthHeaders.oauth_version.should.eql("1.0");
      });
    });

  });
};