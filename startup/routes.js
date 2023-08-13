const express = require("express");
const auth = require("../routers/auth");
const customers = require("../routers/customer");
const genres = require("../routers/genre");
const movies = require("../routers/movie");
const rentals = require("../routers/rental");
const users = require("../routers/user");
const { authenticateToken } = require("../middlewares/authenticate");
const { errorHandler } = require("../middlewares/error");

module.exports = function (app) {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/api/v1/auth", auth);
  app.use("/api/v1/customers", customers);
  app.use("/api/v1/genres", genres);
  app.use("/api/v1/movies", movies);
  app.use("/api/v1/rentals", rentals);
  app.use("/api/v1/users", authenticateToken, users);
  app.use(errorHandler);
};
