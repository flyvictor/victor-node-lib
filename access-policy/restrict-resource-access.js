var _ = require("underscore");
var policies = require("./index").policies;

function iterateLevel(skeleton, req){
  var query = _.isArray(skeleton) ? [] : {};
  _.each(skeleton, function(val, key){
    if(_.isString(val) && /^@/.test(val)){
      query[key] = parseParam(val, req);
    }else if(_.isObject(val)){
      query[key] = iterateLevel(val, req);
    }else{
      query[key] = val;
    }
  });
  return query;

  function parseParam(select, req){
    var nest = select.replace(/^@/, "").split(".");
    var tmp = req;
    _.each(nest, function(k){
      tmp = tmp[k];
    });
    return tmp;
  }
}

function generatePolicyQuery(policy, req){
  var skeleton = policies[policy].query;
  return iterateLevel(skeleton, req);
}

module.exports = {
  name: "restrict-resource-access",
  config: {},
  init: function(){
    return function(req){
      var uFilter = req.query.filter || {};
      var restrictiveQuery = {$or: []};
      _.each(req.accessPolicies, function(p){
        restrictiveQuery.$or.push(generatePolicyQuery(p, req));
      });
      req.query.filter = {
        $and: [uFilter, restrictiveQuery]
      };
      return this;
    }
  }
};
