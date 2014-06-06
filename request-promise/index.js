var request = require("request"),
    when = require("when"),
    _ = require("underscore");

//wraps request's http methods as promises, preserving function signatures and all other methods 
module.exports = _.reduce(["get", "post", "put", "del", "patch"], function(memo, methodName){
  memo[methodName] = function(){
    var deferred = when.defer();

    if (arguments[0].debug) {
      var url = arguments[0].url;

      if (arguments[0].qs) {
        url += "?" + _.reduce(arguments[0].qs, function(memo, value, key) {
          return (memo ? memo + "&" : "") + key + "=" + value;
        }, null);
      }

      console.log("request-promise making %s request to %s", methodName, url);
    }

    request[methodName].apply(request, _.union(arguments, function(err, data){
      return err ? deferred.reject(err) : deferred.resolve(data);
    }));

    return deferred.promise;
  };
  
  return memo;
}, _.clone(request));

module.exports.version = "WEB-3444-update-request-promise-" + Date.now();

// allow a request wrapper to be injected
module.exports.setRequest = function (r) { request = r; };