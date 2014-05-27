//CORS middleware
exports.allowCrossDomain = function(req, res, next) {

  console.info("allowCrossDomain rendering access-control headers");
	
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");

  next();
};
