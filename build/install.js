var fs = require("fs");
var path = require("path");
var proc = require("child_process");
var fail = "\x1B[31mfailed!\x1B[39m";
var ok = "\x1B[32mok\x1B[39m";

function autoExec(packageJson, projectPath) {
  var postCheckoutConfig = packageJson.victorConfig && packageJson.victorConfig.postcheckout ? packageJson.victorConfig.postcheckout : undefined;

  if (postCheckoutConfig && postCheckoutConfig.hasOwnProperty("script")) {

    if (postCheckoutConfig.script) {
      var cmd = postCheckoutConfig.script;
      proc.exec(cmd, { cwd: projectPath }, function (err, stdout, stderr) {
        if (err) {
          console.log("auto hook: " + fail);
          console.log(stdout);
          console.log(stderr);
          process.exit(1);
        } else {
          console.log(stdout);
          console.log("auto hook: " + ok);
        }
      });
    }
  }
}

function addHook(filePath, hookPath, hookName) {

  if (fs.existsSync(hookPath)) {
    // delete file (if it exists)
    fs.unlinkSync(hookPath);
  }

  console.log("Registering... " + hookPath);
  
  var hook = fs.readFileSync(path.join(filePath, hookName));
  fs.writeFileSync(hookPath, hook);
  fs.chmodSync(hookPath, "755");
}

module.exports.init = function (dirName, projectPath, packageJson) {
  
  var filePath = path.join(dirName, "files");
  var gitPath = path.join(projectPath, ".git");
  var preCommitPath = path.join(gitPath, "hooks", "pre-commit");
  var postCheckoutPath = path.join(gitPath, "hooks", "post-checkout");

  if (fs.existsSync(gitPath)) {
    var stats = fs.lstatSync(gitPath);
    if (stats.isDirectory()) {
      
      addHook(filePath, preCommitPath, "pre-commit");
      addHook(filePath, postCheckoutPath, "post-checkout");

      // exectute file
      autoExec(packageJson, projectPath);
    }
  } else {
    console.error("This project doesn\'t appear to be a git repository.");
  }
};