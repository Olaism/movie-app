const mongoose = require("mongoose");
const logger = require("../utils/logger");

module.exports = async function () {
  await mongoose.connect("mongodb://localhost:27017/movie", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  logger.info("Connected to Mongo DB...");
};
