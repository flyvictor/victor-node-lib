var fs = require("fs");
var path = require("path");
var exec = require("child_process").exec;
var fail = "\x1B[31mfailed!\x1B[39m";
var ok = "\x1B[32mok\x1B[39m";

function autoExec(path) {
  var config = require(path + "/package.json"),
  myconfig = config.config && config.config.auto ? config.config.auto : undefined;

  if (myconfig && myconfig.hasOwnProperty("script")) {

    if (myconfig.script && myconfig.script !== true) {
      var cmd = myconfig.script;
      console.log(cmd);
      exec(cmd, { cwd: path }, function (err, stdout, stderr) {
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

module.exports.init = function (dirName, projectPath) {
  
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
      autoExec(projectPath);
    }
  } else {
    console.error("This project doesn\'t appear to be a git repository.");
  }
};