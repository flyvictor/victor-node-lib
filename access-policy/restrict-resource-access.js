var _ = require("underscore");

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

function generatePolicyQuery(policies, policy, req){
  var skeleton = policies[policy].query;
  return iterateLevel(skeleton, req);
}

module.exports = {
  name: "restrict-resource-access",
  priority: 10,
  config: {
    policies: require("./index").policies,
    queryGenerator: generatePolicyQuery
  },
  init: function(options){
    var policies = options.policies || require("./index").policies;
    var generator = options.queryGenerator;
    return function(req){
      var uFilter = req.query.filter || {};
      var restrictiveQuery = {$or: []};
      _.each(req.accessPolicies, function(p){
        restrictiveQuery.$or.push(generator(policies, p, req));
      });
      req.query.filter = {
        $and: [uFilter, restrictiveQuery]
      };
      return this;
    }
  }
};
