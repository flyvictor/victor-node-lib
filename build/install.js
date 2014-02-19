var fs = require('fs');
var path = require('path');

var existsSync = fs.existsSync || path.existsSync;

var projectPath = path.resolve(__dirname, '../../../');
var packagePath = path.join(projectPath, 'package.json');
var projectName = path.basename(projectPath);
var filePath = path.join(__dirname, 'files');
var gitPath = path.join(projectPath, '.git');
var pcPath = path.join(gitPath, 'hooks', 'pre-commit');
var postCheckoutPath = path.join(gitPath, 'hooks', 'post-checkout');
var jsiPath = path.join(projectPath, '.jshintignore');
var jsrcPath = path.join(projectPath, '.jshintrc');
var pcModulePath = path.join(projectPath, '../', '.git', 'modules', projectName, 'hooks');

var exec = require('child_process').exec;
var cwd = process.cwd();
var fail = '\x1B[31mfailed!\x1B[39m';
var ok = '\x1B[32mok\x1B[39m';
var notfound = '\x1B[33mn/a\x1B[39m (no script found)';
var exists = require('fs').existsSync;

function autoExec(path) {
    var config = require(path + '/package.json'),
        myconfig = config.config && config.config.auto ? config.config.auto : undefined;  
    
    if (myconfig && myconfig.hasOwnProperty('script')) {

        if (myconfig.script && myconfig.script !== true) {
            var cmd = myconfig.script;
            console.log(cmd);
            exec(cmd, { cwd: path }, function (err, stdout, stderr) {
                if (err) {
                    console.log('auto hook: ' + fail);
                    console.log(stdout);
                    console.log(stderr);
                    process.exit(1);
                } else {
                    console.log(stdout);
                    console.log('auto hook: ' + ok);
                }
            });
        }
    }
}

if (existsSync(gitPath)) {
    var stats = fs.lstatSync(path.join(projectPath, '.git'));
    if (stats.isDirectory()) {
        if (existsSync(pcPath)) fs.unlinkSync(pcPath);
        if (!existsSync(path.dirname(pcPath))) fs.mkdirSync(path.dirname(pcPath));
        console.log('Found .git directory, adding pre-commit hook');
        var pcHook = fs.readFileSync(path.join(filePath, 'pre-commit'));
        fs.writeFileSync(pcPath, pcHook);
        fs.chmodSync(pcPath, '755');

        // register the post checkout hook
        if (existsSync(postCheckoutPath)) fs.unlinkSync(postCheckoutPath);
        if (!existsSync(path.dirname(postCheckoutPath))) fs.mkdirSync(path.dirname(postCheckoutPath));
        console.log('Found .git directory, adding post-checkout hook');
        var postCheckoutHook = fs.readFileSync(path.join(filePath, 'post-checkout'));
        fs.writeFileSync(postCheckoutPath, postCheckoutHook);
        fs.chmodSync(postCheckoutPath, '755');

        // exectute file
        autoExec(projectPath);
    }
} else if (existsSync(pcModulePath)){
    console.log('Found submodule .git directory, adding pre-commit hook');
    var pcHook = fs.readFileSync(path.join(filePath, 'pre-commit'));
    var pcModuleFullPath = path.join(pcModulePath, 'pre-commit');
    fs.writeFileSync(pcModuleFullPath, pcHook);
    fs.chmodSync(pcModuleFullPath, '755');
} else {
    console.error('This project doesn\'t appear to be a git repository. JSHint configuration will be created anyway. To enable the pre-commit hook, run `git init` and reinstall precommit-hook.');
}

if (!existsSync(jsiPath)) {
    console.log('Did not find a .jshintignore, creating one');
    var jsiFile = fs.readFileSync(path.join(filePath, 'jshintignore'));
    fs.writeFileSync(jsiPath, jsiFile);
}

if (!existsSync(jsrcPath) && (!existsSync(packagePath) || !require(packagePath).hasOwnProperty('jshintConfig'))) {
    console.log('Did not find a .jshintrc and package.json does not contain jshintConfig, creating .jshintrc');
    var jsrcFile = fs.readFileSync(path.join(filePath, 'jshintrc'));
    fs.writeFileSync(jsrcPath, jsrcFile);
}
