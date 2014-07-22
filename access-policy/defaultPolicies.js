var readMyPolicy = {
  query: {
    user: "@user.userId"
  }
};

module.exports = {
  defaultPolicy: readMyPolicy,
  readMyPolicy: readMyPolicy,
  readAllPolicy: {}
};
