var install = require("./install");

/*
var projectPath = path.resolve(__dirname, "../../../");
var filePath = path.join(__dirname, "files");
var packagePath = path.join(projectPath, "package.json");
var projectName = path.basename(projectPath);
var gitPath = path.join(projectPath, ".git");
var pcPath = path.join(gitPath, "hooks", "pre-commit");
var postCheckoutPath = path.join(gitPath, "hooks", "post-checkout");
var jsiPath = path.join(projectPath, ".jshintignore");
var jsrcPath = path.join(projectPath, ".jshintrc");
var pcModulePath = path.join(projectPath, "../", ".git", "modules", projectName, "hooks");
*/

module.exports = function () {
  install.init(__dirname, projectPath);
};