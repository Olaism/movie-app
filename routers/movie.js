const express = require("express");
const { body, param, validationResult } = require("express-validator");
const { Genre } = require("../models/genre");
const { Movie } = require("../models/movie");
const { validateId } = require("../utils/validator");

const router = express.Router();

router.get("/", async function (req, res) {
  const movies = await Movie.find();
  res.send(movies);
});

router.get("/:id", async function (req, res) {
  const { id } = req.params;
  if (!validateId(id)) return res.status(404).send("Not Found");
  const movie = await Movie.findById(id);
  if (!movie) return res.status(404).send("Not Found");
  res.send(movie);
});

router.post("/", [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 255 })
    .withMessage("Title must be between 3 to 255 characters long")
    .toLowerCase()
    .escape(),
  body("genre", "Invalid genre name")
    .trim()
    .notEmpty()
    .withMessage("Genre is required")
    .toLowerCase()
    .escape(),
  body("numberInStock")
    .optional()
    .isInt({ min: 0, max: 200 })
    .withMessage("numberInStock must be a positive integer and maximum of 200"),
  body("dailyRentalRate")
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage("dailyRentalRate must be positive and maximum of 50"),
  async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).send(errors.array());
    const {
      title,
      genre: genreName,
      numberInStock,
      dailyRentalRate,
    } = req.body;
    const genre = await Genre.findOne({ name: genreName });
    if (!genre) return res.status(400).send("Invalid genre");
    const movie = new Movie({
      title: title,
      genre: {
        _id: genre._id,
        name: genre.name,
      },
      numberInStock: numberInStock ? parseInt(numberInStock) : 0,
      dailyRentalRate: dailyRentalRate ? parseInt(dailyRentalRate) : 0,
    });
    await movie.save();
    res.send(movie);
  },
]);

router.put("/:id", [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 255 })
    .withMessage("Title must be between 3 to 255 characters long")
    .toLowerCase()
    .escape(),
  body("genre", "Invalid genre name")
    .trim()
    .notEmpty()
    .withMessage("Genre is required")
    .toLowerCase()
    .escape(),
  body("numberInStock")
    .optional()
    .isInt({ min: 0, max: 200 })
    .withMessage("numberInStock must be a positive integer and maximum of 200"),
  body("dailyRentalRate")
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage("dailyRentalRate must be positive and maximum of 50"),
  async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).send(errors.array());
    const { id } = req.params;
    if (!validateId(id)) return res.status(404).send("Not found");
    const {
      title,
      genre: genreName,
      numberInStock,
      dailyRentalRate,
    } = req.body;
    const genre = await Genre.find({ name: genreName });
    if (!genre) return res.status(400).send("Invalid Genre");
    const movie = await Movie.findByIdAndUpdate(
      id,
      {
        $set: {
          title: title,
          genre: {
            _id: genre._id,
            name: genre.name,
          },
          numberInStock: numberInStock ? parseInt(numberInStock) : 0,
          dailyRentalRate: dailyRentalRate ? parseInt(dailyRentalRate) : 0,
        },
      },
      { new: true }
    );
    if (!movie) return res.status(404).send("Not Found");
    res.send(movie);
  },
]);

router.delete("/:id", async function (req, res) {
  const movie = await Movie.findByIdAndRemove(req.params.id);
  if (!movie) return res.status(404).send("Not Found");
  res.send(movie);
});

module.exports = router;
