const dbDebugger = require("debug")("app:db");
const config = require("config");
require("express-async-errors");
const express = require("express");
const mongoose = require("mongoose");
const auth = require("./routers/auth");
const customers = require("./routers/customer");
const genres = require("./routers/genre");
const movies = require("./routers/movie");
const rentals = require("./routers/rental");
const users = require("./routers/user");
const { authenticateToken } = require("./middlewares/authenticate");
const { errorHandler } = require("./middlewares/error");

if (!config.has("jwtPrivateToken") && !config.has("jwtPrivateKey")) {
  console.error("FATAL ERROR: jwtPrivateToken or jwtPrivateKey not configured");
  process.exit(1);
}

main()
  .then((res) => dbDebugger("Connected to database"))
  .catch((err) => dbDebugger(err));

async function main() {
  await mongoose.connect("mongodb://localhost:27017/movie", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1/auth", auth);
app.use("/api/v1/customers", customers);
app.use("/api/v1/genres", genres);
app.use("/api/v1/movies", movies);
app.use("/api/v1/rentals", rentals);
app.use("/api/v1/users", authenticateToken, users);

app.use(errorHandler);

app.listen(8080, () => console.log("listening on port 8080"));
