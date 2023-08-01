const mongoose = require("mongoose");

const GenreSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 1,
    maxLength: 255,
  },
});

const Genre = mongoose.model("Genre", GenreSchema);

module.exports = Genre;
