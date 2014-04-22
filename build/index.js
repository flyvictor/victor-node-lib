var install = require("./install"),
    path = require("path"),
    projectPath = path.resolve(__dirname, "../../../"),
    packageJson = require(projectPath + "/package.json");

install.init(__dirname, projectPath, packageJson);