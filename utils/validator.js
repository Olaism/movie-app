const mongoose = require("mongoose");

exports.validateId = function (id) {
  return mongoose.isValidObjectId(id);
};

exports.dateRangeValidator = function (date1, date2) {
  return new Date(date1) < new Date(date2);
};
