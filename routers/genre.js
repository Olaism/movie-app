const basicDebugger = require("debug")("app:basic");
const dbDebugger = require("debug")("app:db");
const express = require("express");
const { body, validationResult } = require("express-validator");
const { Genre } = require("../models/genre");
const { validateId } = require("../validator");

const router = express.Router();

router.get("/", async (req, res) => {
  const genres = await Genre.find();
  res.send(genres);
});

router.post("/", [
  // validate the body request
  body("name", "Invalid name")
    .trim()
    .isLength({ min: 1 })
    .toLowerCase()
    .escape(),
  async (req, res) => {
    // check for errors in the body request
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).send(errors.array()[0].msg);

    // check if genre exists to avoid duplicate
    let genre = await Genre.findOne({ name: req.body.name });
    if (genre) return res.status(400).send("name already exists");

    // create a genre object and save to db
    genre = new Genre({
      name: req.body.name,
    });
    await genre.save();
    dbDebugger(`${genre.name} saved to database!`);
    res.send(genre);
  },
]);

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  // validate id param
  const isValidID = validateId(id);
  if (!isValidID) return res.status(404).send("Not found");

  // retrieve genre from db
  const genre = await Genre.findOne({ _id: id });
  if (!genre) return res.status(404).send("Not found");
  res.send(genre);
});

router.put("/:id", [
  // validate request body
  body("name", "Invalid Name")
    .trim(0)
    .isLength({ min: 1 })
    .toLowerCase()
    .escape(),
  async (req, res) => {
    const { id } = req.params;
    const { name: genre_name } = req.body;
    // validate id param
    if (!validateId(id)) return res.status(500).send("Not Found");
    // check for errors in request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.send(errors.array()[0].msg);
    // check if genre with name already exists
    let genre = await Genre.findOne({ name: genre_name });
    if (genre) return res.status(400).send("name already exists!");
    // retrieve genre from db
    genre = await Genre.findById(id);
    if (!genre) return res.status(404).send("Not Found");
    genre.name = genre_name;
    await genre.save();
    res.send(genre);
  },
]);

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  // check if id id valid
  if (!validateId(id)) return res.status(404).send("Not found");
  const genre = await Genre.findByIdAndRemove(id);
  if (!genre) return res.status(404).send("Not found");
  res.send(genre);
});

module.exports = router;
