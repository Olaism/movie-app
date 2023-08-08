const config = require("config");
const jwt = require("jsonwebtoken");

exports.authenticateToken = function (req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);
  jwt.verify(token, config.get("jwtPrivateKey"), (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
