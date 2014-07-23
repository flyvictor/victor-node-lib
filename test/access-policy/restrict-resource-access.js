var _ = require("underscore");
var restrictHook = require("../../access-policy/restrict-resource-access");
var access = require("../../access-policy");

var policies = {
    adminPolicy: {
      restriction: {}
    },
    defaultPolicy: {
      restriction: {
        user: "@user.userId"
      }
    },
    complexPolicy: {
      restriction: {
        $or: [
          {$and: [
            {one: "@user.userId"},
            {two: "@user.userId"}
          ]},
          {three: "@user.userId"}
        ]
      }
    }
};

module.exports = function(){
  describe("Role-based access. Restrict access hook", function(){
    var hook;
    before(function(){
      hook = restrictHook.init({policies: policies});
    });
    it("should be able to augment filter with policy restriction query", function(){
      var req = {
        query: {
          filter: {}
        },
        user: {
          userId: "userID"
        },
        accessPolicies: ["defaultPolicy"]
      };
      hook.call(null, req, {});
      var filter = req.query.filter;
      filter.$and.length.should.equal(2);
      filter.$and[0].should.eql({});
      filter.$and[1].$or.length.should.equal(1);
      filter.$and[1].$or[0].user.should.equal("userID");
    });
    it("should be able to work with array filters", function(){
      var req = {
        query: {
          filter: {
            $or: [{one: "two"}]
          }
        },
        user: {
          userId: "userID"
        },
        accessPolicies: ["defaultPolicy"]
      };
      hook.call(null, req);
      var filter = req.query.filter;
      filter.$and[0].$or[0].one.should.equal("two");
      filter.$and[1].$or[0].user.should.equal("userID");
    });
    it("should work with $in query", function(){
      var req = {
        query: {
          filter: {
            fieldOne: {in: ["one"]},
            fieldTwo: {$in: ["two"]}
          }
        },
        user: {
          userId: "userID"
        },
        accessPolicies: ["defaultPolicy"]
      };
      hook.call(null, req);
      var requestedFilter = req.query.filter.$and[0];
      requestedFilter.fieldOne.in[0].should.equal("one");
      requestedFilter.fieldTwo.$in[0].should.equal("two");
      var restrictiveFilter = req.query.filter.$and[1];
      restrictiveFilter.$or[0].user.should.equal("userID");
    });
    it("should iterate all provided policies", function(){
      var req = {
        query: {},
        user: {
          userId: "userID"
        },
        accessPolicies: ["defaultPolicy", "defaultPolicy", "adminPolicy"]
      };
      hook.call(null, req);
      var requestedFilter = req.query.filter.$and[0];
      _.isEmpty(requestedFilter).should.equal(true);
      var restrictiveFilter = req.query.filter.$and[1];
      restrictiveFilter.$or[0].user.should.equal("userID");
      restrictiveFilter.$or[1].user.should.equal("userID");
      _.isEmpty(restrictiveFilter.$or[2]).should.equal(true);
    });
    it("should not allow access if required policy is not set on resource", function(){
      var req = {
        query: {},
        user: {
          userId: "userID"
        },
        accessPolicies: ["defaultPolicy", "blackhatPolicy", "adminPolicy"]
      };
      var res = {
        send: function(){}
      };
      var self = {};
      var result = hook.call(self, req, res);
      result.should.equal(false);
    });
    it("should play well with complex restriction query", function(){
      var req = {
        query: {},
        user: {
          userId: "userID"
        },
        accessPolicies: ["complexPolicy"]
      };
      hook.call(null, req);
      req.query.filter.$and[1].$or[0].$or[0].$and[0].one.should.equal("userID");
      req.query.filter.$and[1].$or[0].$or[0].$and[1].two.should.equal("userID");
      req.query.filter.$and[1].$or[0].$or[1].three.should.equal("userID");
    });
  });
};