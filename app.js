const dbDebugger = require("debug")("app:db");
const express = require("express");
const mongoose = require("mongoose");
const customers = require("./routers/customer");
const genres = require("./routers/genre");

main()
  .then((res) => dbDebugger("Connected to database"))
  .catch((err) => dbDebugger(err));

async function main() {
  await mongoose.connect("mongodb://localhost:27017/movie");
}

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1/customers", customers);
app.use("/api/v1/genres", genres);

app.listen(8080, () => console.log("listening on port 8080"));
