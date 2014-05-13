var _ = require("underscore"),
    fs = require("fs");

module.exports = {
  modulesInDir: function(dir){
    return _.filter(_.map(fs.readdirSync(dir), function(file){//map
      return dir + "/" + file;
    }), function(file){ return file !== __filename; });
  }
};
