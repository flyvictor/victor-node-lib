var _ = require("underscore"),
    fs = require("fs");

module.exports = {
  modulesInDir: function(dir, except){
    return _.filter(_.map(fs.readdirSync(dir), function(m){//map
      return dir + "/" + m;
    }), function(m){
      return !except || (_.isArray(except) ? except.indexOf(m) !== -1 : m !== except);
    });
  }
};
