const express = require("express");
const logger = require("./utils/logger");
const app = express();

require("express-async-errors");
require("./startup/db")();
require("./startup/config")();
require("./startup/routes")(app);

app.listen(8080, () => logger.info("listening on port 8080"));
