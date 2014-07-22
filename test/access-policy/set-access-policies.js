var setPolicies = require("../../access-policy/set-access-policies");
var access = require("../../access-policy");

module.exports = function(){

  describe("access policies setter", function(){
    var hook;
    before(function(){
      hook = setPolicies.init(setPolicies.config);
    });
    it("should be able to pick policies", function(){
      var req = {
        user: {
          roles: ["Member", "Everyone"]
        },
        clientApp: {
          authenticated: true,
          authKey: "admin-frontend"
        }
      };
      hook.call(null, req);
      req.accessPolicies.length.should.equal(2);
      req.accessPolicies.indexOf("readMyPolicy").should.not.equal(-1);
      req.accessPolicies.indexOf("defaultPolicy").should.not.equal(-1);
    });
    it("should pick proper policy for admin user + admin app", function(){
      var req = {
        user: {
          roles: ["Administrators"]
        },
        clientApp: {
          authenticated: true,
          authKey: "admin-frontend"
        }
      };
      hook.call(null, req);
      req.accessPolicies.length.should.equal(2);
      req.accessPolicies.indexOf("readAllPolicy").should.not.equal(-1);
      req.accessPolicies.indexOf("defaultPolicy").should.not.equal(-1);
    });
    it("should pick proper policy for non-admin user + admin app", function(){
      var req = {
        user: {
          roles: ["Everyone"]
        },
        clientApp: {
          authenticated: true,
          authKey: "admin-frontend"
        }
      };
      hook.call(null, req);
      req.accessPolicies.length.should.equal(2);
      req.accessPolicies.indexOf("readMyPolicy").should.not.equal(-1);
      req.accessPolicies.indexOf("defaultPolicy").should.not.equal(-1);
    });
    it("should pick proper policy for admin user + non-admin app", function(){
      var req = {
        user: {
          roles: ["Administrators"]
        },
        clientApp: {
          authenticated: true,
          authKey: "ios-consumer"
        }
      };
      hook.call(null, req);
      req.accessPolicies.length.should.equal(2);
      req.accessPolicies.indexOf("readMyPolicy").should.not.equal(-1);
      req.accessPolicies.indexOf("defaultPolicy").should.not.equal(-1);
    });
    it("should pick proper police for non-admin user + non-admin app", function(){
      var req = {
        user: {
          roles: ["Everyone", "Member"]
        },
        clientApp: {
          authenticated: true,
          authKey: "ios-consumer"
        }
      };
      hook.call(null, req);
      req.accessPolicies.length.should.equal(2);
      req.accessPolicies.indexOf("readMyPolicy").should.not.equal(-1);
      req.accessPolicies.indexOf("defaultPolicy").should.not.equal(-1);
    });
  });
};
