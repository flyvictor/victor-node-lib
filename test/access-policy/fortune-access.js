var FortuneAccess = require("../../access-policy/fortune-access");

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
    access.setupHttpFilters(express);
    express.mw.length.should.equal(2);
  });

});
