const express = require("express");
const mongoose = require("mongoose");
const Customer = require("../models/customer");
const { Rental } = require("../models/rental");
const { Movie } = require("../models/movie");
const { body, validationResult } = require("express-validator");
const { validateId } = require("../validator");

const router = express.Router();

router.get("/", async function (req, res) {
  const rentals = await Rental.find();
  res.send(rentals);
});

router.post("/", [
  body("customerId", "Invalid customer ID").trim().isMongoId(),
  body("movieId", "Invalid movie ID").trim().isMongoId(),
  async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).send(errors.array()[0].msg);

    const { customerId, movieId } = req.body;

    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(400).send("Invalid movie ID");

    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(400).send("Invalid customer ID");

    if (movie.numberInStock === 0)
      return res.status(400).send("Movie not in stock");

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const rental = new Rental({
        customer: customerId,
        movie: movieId,
      });
      await rental.save({ session });

      movie.numberInStock--;
      await movie.save({ session });

      session.commitTransaction();

      res.status(201).send(rental);
    } catch (err) {
      await session.abortTransaction();
      return res.status(500).send("Error creating rental");
    } finally {
      session.endSession();
    }
  },
]);

router.get("/:id", async function (req, res) {
  // validate id
  if (!validateId(req.params.id)) return res.status(404).send("Not Found");
  const rental = await Rental.findById(req.params.id);
  if (!rental) return res.status(404).send("Not Found");
  res.send(rental);
});

router.put("/:id", [
  body("customerId", "Invalid customer ID").trim().isMongoId(),
  body("movieId", "Invalid movie ID").trim().isMongoId(),
  async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).send(errors.array()[0].msg);

    const { customerId, movieId } = req.body;

    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(400).send("Invalid movie id");

    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(400).send("Invalid customer id");

    if (movie.numberInStock === 0)
      return res.status(400).send("Movie not in stock");

    const rental = await Rental.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          customer: customerId,
          movie: movieId,
        },
      },
      { new: true }
    );

    if (!rental) return res.status(404).send("Not Found");
    await rental.save();

    res.send(rental);
  },
]);

router.delete("/", async function (req, res) {
  // validate id
  if (!validateId(req.params.id)) return res.status(404).send("Not Found");
  const rental = await Rental.findByIdAndRemove(req.params.id);
  if (!rental) return res.status(404).send("Not Found");
  res.send(rental);
});

module.exports = router;
