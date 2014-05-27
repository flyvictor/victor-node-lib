exports.enforceHttps = function(req, res, next) {

  console.info("enforceHttps x-forwarded-proto : %s", req.headers["x-forwarded-proto"]);

  if (req.headers["x-forwarded-proto"] === "https") {
    next();
  }
  else {
    console.error("enforceHttps request failed https check, rejecting as HTTP 401");
    res.send(401, "Unauthorized");
  }
};