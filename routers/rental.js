const express = require("express");
const mongoose = require("mongoose");
const Customer = require("../models/customer");
const { Rental } = require("../models/rental");
const { Movie } = require("../models/movie");
const { body, validationResult } = require("express-validator");
const { validateId } = require("../validator");

const router = express.Router();

router.get("/", async function (req, res) {
  const rentals = await Rental.find()
    .populate({
      path: "customer",
      select: "_id username",
    })
    .populate({
      path: "movie",
      select: "_id title",
    })
    .sort({ dateOut: -1 });
  res.send(rentals);
});

router.post("/", [
  body("customerId", "Invalid customer ID").trim().isMongoId(),
  body("movieId", "Invalid movie ID").trim().isMongoId(),
  body("dateOut").optional().isDate().withMessage("Invalid date"),
  async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).send(errors.array()[0].msg);

    const { customerId, movieId, dateOut } = req.body;

    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).send("Movie not found");

    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).send("Customer not found");

    if (movie.numberInStock === 0)
      return res.status(400).send("Movie not in stock");

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const rental = new Rental({
        customer: customerId,
        movie: movieId,
        dateOut: dateOut || Date.now(),
      });
      movie.numberInStock--;

      await rental.save({ session });
      await movie.save({ session });
      await session.commitTransaction();

      res.status(201).send(rental);
    } catch (err) {
      console.log(err);
      await session.abortTransaction();
      return res.status(500).send("Error creating rental");
    } finally {
      session.endSession();
    }
  },
]);

router.get("/:id", async function (req, res) {
  // validate id
  if (!validateId(req.params.id)) return res.sendStatus(404);
  const rental = await Rental.findById(req.params.id)
    .populate("customer", "_id username")
    .populate("movie", "_id title");
  if (!rental) return res.sendStatus(404);
  res.send(rental);
});

router.put("/:id", [
  body("customerId", "Invalid customer ID").optional().trim().isMongoId(),
  body("movieId", "Invalid movie ID").optional().trim().isMongoId(),
  body("dateOut")
    .optional()
    .isDate()
    .withMessage("dateOut has an invalid date format"),
  async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).send(errors.array()[0].msg);

    const { customerId, movieId, dateOut } = req.body;

    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).send("Movie not found");

    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).send("Customer not found");

    if (movie.numberInStock === 0)
      return res.status(400).send("Movie not in stock");

    const { id } = req.params;

    if (!validateId(id)) return res.sendStatus(404);

    const oldRental = await Rental.findById(id);

    const session = await mongoose.startSession();
    session.startSession();
    try {
      const rental = await Rental.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            customer: customerId || oldRental.customer,
            movie: movieId || oldRental.movie,
            dateOut: dateOut || Date.now(),
          },
        },
        { new: true },
        { session }
      );

      if (!rental) return res.status(404).send("Not Found");
      // get the old movie and roll back the numberInStock value
      await Movie.findByIdAndUpdate(
        oldRental.movie,
        {
          $set: { numberInStock: numberInStock++ },
        },
        { session }
      );
      // update the numberInStock value as a rental is made
      movie.numberInStock--;
      await movie.save({ session });
      await session.commitTransaction();
      res
        .status(201)
        .send(
          rental
            .populate("customer", "_id username")
            .populate("movie", "_id title")
        );
    } catch (ex) {
      session.abortTransaction();
      return res.sendStatus(500);
    } finally {
      session.endSession();
    }
  },
]);

router.delete("/", async function (req, res) {
  // validate id
  if (!validateId(req.params.id)) return res.sendStatus(404);
  const rental = await Rental.findByIdAndRemove(req.params.id);
  if (!rental) return res.sendStatus(404);
  res.status(204).send(rental);
});

module.exports = router;
