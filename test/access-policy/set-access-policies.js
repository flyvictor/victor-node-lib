var setPolicies = require("../../access-policy/set-access-policies");
var access = require("../../access-policy");

var testPolicies = require("../../access-policy").policies;

module.exports = function(){

  describe("access policies setter", function(){
    var hook;
    before(function(){
      hook = setPolicies.init({
        predicates: [testPolicies.adminPolicy, testPolicies.defaultPolicy],
        adminRoles: ["admin"],
        adminApps: ["admin"]
      });
    });
    it("should be able to pick policies", function(){
      var req = {
        user: {
          roles: ["admin"]
        },
        clientApp: {
          authenticated: true,
          authKey: "admin"
        }
      };
      hook.call(null, req);
      req.accessPolicies.length.should.equal(2);
      req.accessPolicies.indexOf("adminPolicy").should.not.equal(-1);
      req.accessPolicies.indexOf("defaultPolicy").should.not.equal(-1);
    });
    it("should pick proper policy for admin user + admin app", function(){
      var req = {
        user: {
          roles: ["admin"]
        },
        clientApp: {
          authenticated: true,
          authKey: "admin"
        }
      };
      hook.call(null, req);
      req.accessPolicies.length.should.equal(2);
      req.accessPolicies.indexOf("adminPolicy").should.not.equal(-1);
      req.accessPolicies.indexOf("defaultPolicy").should.not.equal(-1);
    });
    it("should pick proper policy for non-admin user + admin app", function(){
      var req = {
        user: {
          roles: ["somebody"]
        },
        clientApp: {
          authenticated: true,
          authKey: "admin"
        }
      };
      hook.call(null, req);
      req.accessPolicies.length.should.equal(1);
      req.accessPolicies.indexOf("defaultPolicy").should.not.equal(-1);
    });
    it("should pick proper policy for admin user + non-admin app", function(){
      var req = {
        user: {
          roles: ["admin"]
        },
        clientApp: {
          authenticated: true,
          authKey: "postman"
        }
      };
      hook.call(null, req);
      req.accessPolicies.length.should.equal(1);
      req.accessPolicies.indexOf("defaultPolicy").should.not.equal(-1);
    });
    it("should pick proper police for non-admin user + non-admin app", function(){
      var req = {
        user: {
          roles: ["someone"]
        },
        clientApp: {
          authenticated: true,
          authKey: "postman"
        }
      };
      hook.call(null, req);
      req.accessPolicies.length.should.equal(1);
      req.accessPolicies.indexOf("defaultPolicy").should.not.equal(-1);
    });
  });
};
