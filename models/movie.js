const mongoose = require("mongoose");
const { GenreSchema } = require("./genre");
const MovieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minLength: 3,
    maxLength: 255,
  },
  genre: {
    type: GenreSchema,
    required: true,
  },
  numberInStock: {
    type: Number,
    default: 0,
    min: 0,
    max: 200,
  },
  dailyRentalRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 50,
  },
});

const Movie = mongoose.model("Movie", MovieSchema);

exports.Movie = Movie;
exports.MovieSchema = MovieSchema;
