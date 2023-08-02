const mongoose = require("mongoose");

const GenreSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 5,
    maxLength: 50,
  },
});

const Genre = mongoose.model("Genre", GenreSchema);

exports.Genre = Genre;
exports.GenreSchema = GenreSchema;
