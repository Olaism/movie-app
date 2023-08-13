const logger = require("../utils/logger");

const errorHandler = (err, req, res) => {
  logger.error(err.message, err);

  res.status(err.status || 500);

  res.json({ error: err.message });
};

module.exports = { errorHandler };
