const express = require("express");
const { check } = require("express-validator");
const multer = require("multer");

const router = express.Router();

const { fileUpload } = require("../middleware/file-upload");

const usersControllers = require("../controllers/users-controllers");

// api/users/
router.get("/", usersControllers.getAllUsers);

// api/users/signup
router.post(
  "/signup",
  fileUpload.single("image"),
  // [
  //   check("name").isLength({ min: 5 }),
  //   check("email").normalizeEmail().isEmail(),
  //   check("password").isLength({ min: 5 }),
  // ],
  usersControllers.signUp
);

// api/users/login
router.post("/login", usersControllers.login);

module.exports = router;
