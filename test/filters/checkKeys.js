var keysChecker = require("../../filters/checkKeys"),
    sinon = require("sinon");

module.exports = function(){
  describe("extracting keys", function(){
    it("extracts the secret correctly", function(){
      var secret1 = keysChecker.getKey("legacy-application");
      var secret2 = keysChecker.getKey("admin-frontend");
      
      secret1.should.eql("kfJyFWwUB3ZXNr0KC!vRz$");
      secret2.should.eql("3BckWpCNwqSGdD9g*nZDN");
    });
  });
  describe("checkKeys filter", function(){
    var req, res, next;

    beforeEach(function(){
      req = {
        protocol: "https",
        headers: {host: "localhost:3012"},
        body: {key: "value"},
        method: "POST",
        path: "/sync-something",
        query: {
          "authKey": "admin-frontend"
        }
      };

      res = {
          send: sinon.stub()
        };

      next = sinon.spy();
    });

    it("should call send 401 if the signature is incorrect", function(){
      keysChecker.checkKeys(req, res, next);
      res.send.should.have.been.calledWith(401);
    });

    it("should call send 401 if the authKey does not exist", function(){
      req.query.authKey = "random+crap";
      keysChecker.checkKeys(req, res, next);
      res.send.should.have.been.calledWith(401);
    });

    it("should call next if the signature is correct", function(){
      req.query.authSignature = "JssQACBEOA1X7EFXCPMN7Cnx1as=";
      keysChecker.checkKeys(req, res, next);
      next.callCount.should.eql(1);
    });

    it("should call send 401 if the signature is incorrect", function(){
      req.query.authSignature = "JssQACBEOA1X7EFXCPMN7Cnx1as"; //missing = at the end of the string
      keysChecker.checkKeys(req, res, next);
      next.callCount.should.eql(0);
      res.send.should.have.been.calledWith(401);
    });
  });
}; 
