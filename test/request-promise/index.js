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
    _.each(_.keys(request), function(requestKey){
      _.keys(requestPromise).should.include(requestKey);
    });
  });

  describe("http method", function(){
    var testHttpMethodResolvesFor = function(name){
      return function(done){
        sinon.stub(request, name).callsArgWith(1,null,{data:true,statusCode: 200});
        
        requestPromise[name]({url: "testurl"}).then(function(data){
          expect(data).to.eql({data:true, statusCode: 200});
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

    var testHttpMethodStatusCheckingFor = function(name){
      return function(done){
        sinon.stub(request, name).callsArgWith(1,null, {statusCode: 400, body: "Bad request"});
        requestPromise[name]({url:"testurl"}).then(function(){ }).catch(function(err){
          err.should.eql("400: Bad request");
        }).should.notify(done);
        request[name].restore();
      };
    };

    _.each(["put","post", "del", "put", "patch"], function(method){
      it("is wrapped as a promise that can resolve: " + method, testHttpMethodResolvesFor(method));
      it("is wrapped as a promise that can error:" + method, testHttpMethodErrorsFor(method));
      it("is wrapped as a promise the errors with non 2xx status: " + method, testHttpMethodStatusCheckingFor(method));
    });

  });

});
