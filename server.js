const fs = require("fs");
const cors = require("cors");
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser"); // Parse any incoming body to extract JSON data
const functions = require("firebase-functions");

const HttpError = require("./models/http-error");

require("dotenv").config();

const usersRoutes = require("./routes/users-routes");
const placesRoutes = require("./routes/places-routes");

const app = express();

app.set("view engine", "ejs");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  // Specify what IP Address allowed to access resource
  res.setHeader("Access-Control-Allow-Origin", "*");
  // Specify what headers allowed to use
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  // Specify what methods allowed to use
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

// Static used to return file (not execute)
app.use("/uploads/images", express.static(__dirname + "/uploads/images"));

app.use("/api/places", placesRoutes); // api/places/...
app.use("/api/users", usersRoutes); // api/users/...

// app.use((error, req, res, next) => {
//   // Rollback (delete) when there is error one image upload, because image will automatically stored when sign up API hitted
//   if (req.file) fs.unlink(req.file.path, (err) => console.log(err));

//   if (res.headerSent) return next(error);

//   res.status(error.code || 500);
//   res.json({ message: error.message || "An unknown error occured!" });
// });

// Error Handler
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal Server Error" });
});

const DB_USER = process.env.DB_USER || functions.config().db_user;
const DB_PASSWORD = process.env.DB_PASSWORD || functions.config().db_password;
const DB_NAME = process.env.DB_NAME || functions.config().db_name;

mongoose
  .connect(
    `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_NAME}.o1y8qtm.mongodb.net/?retryWrites=true&w=majority&appName=${DB_NAME}`
  )
  .then(() => {
    console.log("Successfully connected to database!");
    app.listen(5313);
  })
  .catch((error) => {
    console.log("Failed to connect to database!", error);
  });

exports.api = functions.https.onRequest(app);
