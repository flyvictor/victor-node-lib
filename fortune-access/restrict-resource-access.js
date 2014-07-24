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
  var skeleton = policies[policy].restriction;
  return iterateLevel(skeleton, req);
}

module.exports = {
  name: "restrict-resource-access",
  config: {
    policies: {},
    queryGenerator: generatePolicyQuery
  },
  init: function(options){
    var policies = options.policies;
    var generator = options.queryGenerator || generatePolicyQuery;
    return function(req, res){
      var uFilter = req.query.filter || {};
      var restrictiveQuery = {$or: []};
      var errors = _.map(req.accessPolicies, function(p){
        if (!policies[p]) return p;
        restrictiveQuery.$or.push(generator(policies, p, req));
      });
      if (_.compact(errors).length !== 0){
        console.log("Policies: ", _.compact(errors).join(","), " are not defined");
        res.send(500, "Internal server error");
        return false;
      }
      if (restrictiveQuery.$or.length){
        req.query.filter = {
          $and: [uFilter, restrictiveQuery]
        };
      }
      return this;
    }
  }
};
