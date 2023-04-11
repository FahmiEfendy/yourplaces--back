const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser"); // Parse any incoming body to extract JSON data

const Place = require("./models/place");
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

mongoose
  .connect(
    "mongodb+srv://fahmiefendy:fahmiefendy1102@cluster-place.arkm4vk.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Successfully connected to database!");
    app.listen(5000);
  })
  .catch((error) => console.log("Failed to connect to database!", error));
