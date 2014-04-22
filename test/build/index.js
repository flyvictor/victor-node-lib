var install = require("../../build/install"),
    fs = require("fs"),
    path = require("path"),
    proc = require("child_process");

module.exports = function (util) {

  describe("Build Install Initialisation", function() {

    var dirName = "./dir";
    var projectPath = "./project";

    beforeEach(function(){
      util.sandbox.stub(fs, "existsSync");
      util.sandbox.stub(fs, "lstatSync");
      util.sandbox.stub(fs, "unlinkSync");
      util.sandbox.stub(fs, "readFileSync");
      util.sandbox.stub(fs, "writeFileSync");
      util.sandbox.stub(fs, "chmodSync");
      util.sandbox.stub(path, "join");
      util.sandbox.stub(path, "dirname");
      util.sandbox.stub(console, "error");
      util.sandbox.stub(proc, "exec");
      path.join.withArgs(dirName, "files").returns("file-path");
      path.join.withArgs(projectPath, ".git").returns("git-path");
      path.join.withArgs("git-path", "hooks", "pre-commit").returns("pre-commit-path");
      path.join.withArgs("git-path", "hooks", "post-checkout").returns("post-checkout-path");
    });

    it("should set the expected path variables", function () {
      fs.existsSync.withArgs("git-path").returns(false);
      install.init(dirName, projectPath);
      path.join.withArgs(projectPath, ".git").should.have.callCount(1);
      path.join.withArgs("git-path", "hooks", "pre-commit").should.have.callCount(1);
      path.join.withArgs("git-path", "hooks", "post-checkout").should.have.callCount(1);
    });

    it("should output console error if no git path is found", function() {
      fs.existsSync.withArgs("git-path").returns(false);
      install.init(dirName, projectPath);
      console.error.should.be.calledWith("This project doesn\'t appear to be a git repository.");
    });

    it("should register hooks if git directory exists", function () {
      // Arrange
      fs.existsSync.withArgs("git-path").returns(true);
      fs.existsSync.withArgs("pre-commit-path").returns(true);
      fs.existsSync.withArgs("post-checkout-path").returns(true);
      fs.lstatSync.withArgs("git-path").returns({ isDirectory: function () { return true; } });
      path.join.withArgs("file-path", "pre-commit").returns("file-path/pre-commit-path");
      path.join.withArgs("file-path", "post-checkout").returns("file-path/post-checkout-path");
      fs.readFileSync.withArgs("file-path/pre-commit-path").returns("pre-data");
      fs.readFileSync.withArgs("file-path/post-checkout-path").returns("post-data");
      fs.writeFileSync.withArgs("pre-commit-path", "pre-data");
      fs.writeFileSync.withArgs("post-checkout-path", "post-data");
      fs.chmodSync.withArgs("pre-commit-path", "755");
      fs.chmodSync.withArgs("post-checkout-path", "755");
      
      var config = {
        "victorConfig": {
          "precommit": {
            "lint": true
          },
          "postcheckout" : {
            "script" : "./hooks/checkout-submodules"
          }
        }
      };

      proc.exec.yields(null, "std out", "no error");

      // Act
      install.init(dirName, projectPath, config);

      // Assert
      fs.lstatSync.withArgs("git-path").should.have.callCount(1);
      fs.existsSync.withArgs("pre-commit-path").should.have.callCount(1);
      fs.existsSync.withArgs("post-checkout-path").should.have.callCount(1);
      fs.unlinkSync.withArgs("pre-commit-path").should.have.callCount(1);
      fs.unlinkSync.withArgs("post-checkout-path").should.have.callCount(1);
      fs.readFileSync.withArgs("file-path/pre-commit-path").should.have.callCount(1);
      fs.readFileSync.withArgs("file-path/post-checkout-path").should.have.callCount(1);
      fs.writeFileSync.withArgs("pre-commit-path", "pre-data").should.have.callCount(1);
      fs.writeFileSync.withArgs("post-checkout-path", "post-data").should.have.callCount(1);
      fs.chmodSync.withArgs("pre-commit-path", "755").should.have.callCount(1);
      fs.chmodSync.withArgs("post-checkout-path", "755").should.have.callCount(1);
      proc.exec.should.have.callCount(1);
    });

    it("should not register hooks if git directory doesn't exist", function () {
      // Arrange
      fs.existsSync.withArgs("git-path").returns(false);
    
      // Act
      install.init(dirName, projectPath);

      // Assert
      fs.lstatSync.withArgs("git-path").should.have.callCount(0);
      fs.chmodSync.withArgs("pre-commit-path", "755").should.have.callCount(0);
      fs.chmodSync.withArgs("post-checkout-path", "755").should.have.callCount(0);
    });

  });

};