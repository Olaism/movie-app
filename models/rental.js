const mongoose = require("mongoose");

const RentalSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  movie: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  dateOut: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  dateReturned: Date,
  rentalFee: {
    type: Number,
    min: 0,
    default: 0,
  },
});

const Rental = mongoose.model("Rental", RentalSchema);

exports.RentalSchema = RentalSchema;
exports.Rental = Rental;
