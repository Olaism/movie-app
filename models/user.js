const config = require("config");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    minLength: 5,
    maxLength: 255,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    minLength: 5,
    maxLength: 255,
  },
  password: {
    type: String,
    minlength: 8,
    maxlength: 1024,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

UserSchema.methods.genAuthToken = function () {
  const { _id, isAdmin } = this;
  return jwt.sign({ _id, isAdmin }, config.get("jwtPrivateKey"), {
    expiresIn: config.get("jwt.expiresIn"),
  });
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
