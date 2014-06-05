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
  
    it("should work with authKey in header", function(){
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

  });
};