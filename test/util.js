var _ = require("underscore");

module.exports = {
  testDependencies: function(){
    var chai = require("chai"),
        sinon = require("sinon"),
        sinonChai = require("sinon-chai"),
        chaiAsPromised = require("chai-as-promised");

    chai.should();
    chai.use(sinonChai);
    chai.use(chaiAsPromised);

    return {
      chai: chai,
      sinon: sinon,
      sinonChai: sinonChai,
      chaiAsPromised: chaiAsPromised
    };
  },
  requireSpecs: function(specs){
    _.each(specs, function(spec){ require(spec)(this); },this);
  },
};