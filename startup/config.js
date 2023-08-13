const config = require("config");

module.exports = function () {
  if (!config.has("jwtPrivateToken") && !config.has("jwtPrivateKey")) {
    throw new Error(
      "FATAL ERROR: jwtPrivateToken or jwtPrivateKey not configured"
    );
  }
};
