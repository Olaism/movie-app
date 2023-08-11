const mongoose = require("mongoose");

const RentalSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    movie: {
      type: mongoose.Types.ObjectId,
      ref: "Movie",
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
      required: function () {
        return this.dateReturned;
      },
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);

const Rental = mongoose.model("Rental", RentalSchema);

exports.RentalSchema = RentalSchema;
exports.Rental = Rental;
