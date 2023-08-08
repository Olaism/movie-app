const errorHandler = (err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500);

  res.json({ error: err.message });
};

module.exports = { errorHandler };
