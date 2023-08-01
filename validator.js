const mongoose = require("mongoose");

exports.validateId = function (id) {
  return mongoose.isValidObjectId(id);
};
