var _ = require("lodash");
var FortuneAccess = require("../../fortune-access");

describe("FortuneAccess", function(){
  var access;
  beforeEach(function(){
    access = FortuneAccess();
  });

  it("should be able to initialize express filters", function(){
    access.useC(function(one, two){
      return function(req, res, next){
        next(one + two);
      }
    }, "Hello ", "world");
    access._middleware.length.should.equal(1);
    access._middleware[0].length.should.equal(3);
    access._middleware[0](null, null, function(i){
      i.should.equal("Hello world");
    });
  });

  it("should be able to set http filters on express instance", function(){
    var express = {
      mw: [],
      use: function(fn){
        this.mw.push(fn);
      }
    };
    access.useC(function(){return function(){}});
    access.use(function(){});
    access.setupHttpFilters(express);
    express.mw.length.should.equal(2);
  });

  it("should be able to consume augmentor hooks and define highest priority on them");

  it("should throw if provided policy is invalid", function(){
    (function(){
      FortuneAccess([{name: null}]);
    }).should.throw("Policy null is invalid");
  });

  it("should be able to get proper policy predicate functions", function(){
    var pOne = {name: "one", predicate: function(){}};
    var pTwo = {name: "two", predicate: function(){}};
    var itAccess = FortuneAccess([pOne, pTwo]);
    var preds = itAccess._getPredicates({policy: {one: {}}});
    preds.length.should.equal(1);
    preds[0].name.should.equal("one");
  });

  it("should not fail in resource has no policy set up", function(){
    (function(){
      var itAccess = FortuneAccess({
        one: {name: "one", predicate: function(){}},
        two: {name: "two", predicate: function(){}}
      });
      var preds = itAccess._getPredicates({});
      preds.should.eql([]);
    }).should.not.throw();
  });

  it("should be able to set configured hooks on provided resources", function(){
    var app = {
      hooks: {},
      beforeRW: function(name, array, config){
        this.hooks[name] = this.hooks[name] || {};
        array.forEach(function(h){
          var clone = _.cloneDeep(h);
          clone.config = config[clone.name];
          this.hooks[name][clone.name] = clone;
        }, this);
      },
      _resources: {
        one: {policy: {firstPolicy: {}}},
        two: {policy: {}},
        three: {}
      }
    };
    var fa = FortuneAccess([
      {name: 'firstPolicy', predicate: function(){}},
      {name: 'secondPolicy', predicate: function(){}}
    ], ["adminRole"], ["adminApp"]);
    fa._setupHooks(app);
    var oneSet = app.hooks.one["set-access-policies"];
    oneSet.config.predicates.length.should.equal(1);
    oneSet.config.adminRoles.length.should.equal(1);
    var oneRestrict = app.hooks.one["restrict-resource-access"];
    oneRestrict.config.policies.firstPolicy.should.be.Object;

    oneSet.priority.should.be.greaterThan(oneRestrict.priority);
  });
});
