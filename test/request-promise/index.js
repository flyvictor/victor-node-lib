var chai = require("chai"),
    sinon = require("sinon"),
    sinonChai = require("sinon-chai"),
    request = require("request"),
    requestPromise = require("../../request-promise"),
    chaiAsPromised = require("chai-as-promised"),
    expect = chai.expect,
    _ = require("underscore");

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

describe("requestPromise", function(){
  it("makes all request methods available", function(){
    _.keys(requestPromise).should.eql(_.keys(request));
  });

  describe("http method", function(){
    var testHttpMethodResolvesFor = function(name){
      return function(done){
        sinon.stub(request, name).callsArgWith(1,null,{data:true});
        
        requestPromise[name]({url: "testurl"}).then(function(data){
          expect(data).to.eql({data:true});
          done();
        }).catch(function(err){ console.log("ERROR",err);});

        request[name].restore();
      };
    };

    var testHttpMethodErrorsFor = function(name){
      return function(done){
        sinon.stub(request, name).callsArgWith(1,{error: true}, {data:true});
        requestPromise[name]({url:"testurl"}).then(function(){ }).catch(function(err){
          err.should.eql({error: true});
          done();
        });
        request[name].restore();
      };
    };

    _.each(["put","post", "del", "put", "patch"], function(method){
      it("is wrapped as a promise that can resolve: " + method, testHttpMethodResolvesFor(method));
      it("is wrapped as a promise that can error:" + method, testHttpMethodErrorsFor(method));
    });

  });

});
