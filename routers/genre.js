const dbDebugger = require("debug")("app:db");
const _ = require("lodash");
const express = require("express");
const { body, validationResult } = require("express-validator");
const { Genre } = require("../models/genre");
const { Movie } = require("../models/movie");
const { validateId } = require("../utils/validator");

const router = express.Router();

router.get("/", async (req, res) => {
  const genres = await Genre.find().select("_id, name").sort({ name: "asc" });
  res.send(genres);
});

router.post("/", [
  // validate the body request
  body("name")
    .trim()
    .notEmpty()
    .withMessage("name cannot be empty")
    .isLength({ min: 5, max: 255 })
    .withMessage(
      "name must have at least 5 characters and maximum of 255 characters"
    )
    .toLowerCase()
    .escape(),
  async (req, res) => {
    // check for errors in the body request
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).send(errors.array()[0].msg);

    // check if genre exists to avoid duplicate
    let genre = await Genre.findOne({ name: req.body.name });
    if (genre) return res.status(400).send("genre already exists.");

    // create a genre object and save to db
    genre = new Genre({
      name: req.body.name,
    });
    await genre.save();
    dbDebugger(`${genre.name} saved to database!`);
    res.status(201).send(_.pick(genre, "_id", "name"));
  },
]);

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  // validate id param
  const isValidID = validateId(id);
  if (!isValidID) return res.sendStatus(404);

  // retrieve genre from db
  let genre = await Genre.findOne({ _id: id }).select("_id, name");
  if (!genre) return res.sendStatus(404);
  // get movies with the genre
  const movies = await Movie.find({ "genre._id": genre._id }).select(
    "_id, title"
  );
  genre = { ...genre._doc, movies };
  res.send(_.pick(genre, "_id", "name"));
});

router.put("/:id", [
  // validate request body
  body("name")
    .trim()
    .notEmpty()
    .withMessage("name cannot be empty")
    .isLength({ min: 5, max: 255 })
    .withMessage(
      "name must have at least 5 characters and maximum of 255 characters"
    )
    .toLowerCase()
    .escape(),
  async (req, res) => {
    const { id } = req.params;
    const { name: genre_name } = req.body;
    // validate id param
    if (!validateId(id)) return res.sendStatus(400);
    // check for errors in request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.send(errors.array()[0].msg);
    // check if genre with name already exists
    let genre = await Genre.findOne({ name: genre_name });
    if (genre) return res.status(400).send("genre already exists!");
    // retrieve genre from db
    genre = await Genre.findByIdAndUpdate(
      id,
      {
        $set: {
          name: genre_name,
        },
      },
      { new: true }
    );
    if (!genre) return res.sendStatus(404);
    res.status(201).send(_.pick(genre, ["_id", "name"]));
  },
]);

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  // check if id id valid
  if (!validateId(id)) return res.status(404).send("Not found");
  const genre = await Genre.findByIdAndRemove(id);
  if (!genre) return res.status(404).send("Not found");
  res.status(204).send(_.pick(genre, ["_id", "name"]));
});

module.exports = router;
