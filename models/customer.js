const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  phone: String,
  email: {
    type: String,
    required: true,
    minLength: 5,
  },
  isGold: {
    type: Boolean,
    default: false,
  },
});

const Customer = mongoose.model("Customer", CustomerSchema);

module.exports = Customer;
