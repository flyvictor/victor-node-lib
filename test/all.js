var util = require("./util"),
    dependencies = util.testDependencies();

describe("victor-node-lib", function(){
  beforeEach(function(){
    util.sandbox = dependencies.sinon.sandbox.create();
    util.should = dependencies.chai.should();
  });

  afterEach(function(){
    util.sandbox.restore();
  });

  util.requireSpecs([
    "./datetime",
    "./requestSigner",
    "./filters/checkKeys"
  ]);
});