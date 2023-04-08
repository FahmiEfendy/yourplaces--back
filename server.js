const express = require("express");
const bodyParser = require("body-parser"); // Parse any incoming body to extract JSON data

const HttpError = require("./models/http-error");

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");

const app = express();

app.use(bodyParser.json());

app.use("/api/places", placesRoutes); // api/places/...
app.use("/api/users", usersRoutes); // api/users/...

app.use((req, res, next) => {
  const error = new HttpError("Could not find any matches routes!", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) return next(error);

  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured!" });
});

app.listen(5000);
