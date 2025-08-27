const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const functions = require("firebase-functions");
const { validationResult } = require("express-validator");

const { storage } = require("../middleware/file-upload");

const User = require("../models/user");

const HttpError = require("../models/http-error");

const JWT_TOKEN_KEY =
  process.env.JWT_TOKEN_KEY || functions.config().jwt_token_key;

const getAllUsers = async (req, res, next) => {
  let allUsers;

  try {
    // "-" : exclude a Property
    allUsers = await User.find({}, "-password");
  } catch (err) {
    return next(
      new HttpError(`Failed to get all user because of ${err.message}`, 500)
    );
  }

  res.status(200).json({
    message: "Successfully get all users data",
    data: allUsers.map((user) => user.toObject({ getters: true })),
  });
};

const signUp = async (req, res, next) => {
  const file = req.file;

  const bucket = storage.bucket();

  const storageRef = bucket.file(file.originalname);
  const blobStream = storageRef.createWriteStream();

  blobStream.on("finish", async () => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      console.log(error);

      return next(
        new HttpError(
          `Input value for ${error.errors[0].param} is an ${error.errors[0].msg}`,
          500
        )
      );
    }

    const { name, email, password } = req.body;

    let userExist;

    try {
      userExist = await User.findOne({ email: email });
    } catch (err) {
      const error = new HttpError(
        `Cannot find a user with email of ${email}`,
        500
      );
      return next(error);
    }

    if (userExist) {
      return next(
        new HttpError(`User with email of ${email} already exist!`, 422)
      );
    }

    // Encrypt Password
    let hashedPassword;
    try {
      // Second asrgument from bcrypt.hash() define how strange the encryption
      hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
      return next(
        new HttpError(`Could not create a user because of ${err.message}`, 500)
      );
    }

    const newUser = new User({
      name,
      email,
      image: req.file.originalname,
      password: hashedPassword,
      places: [],
    });

    try {
      await newUser.save();
    } catch (err) {
      const error = new HttpError(
        `Failed to created new data because of ${err.message}`,
        500
      );
      return next(error);
    }

    let token = "11";
    try {
      token = jwt.sign(
        {
          userId: newUser.id, // Id generated from MongoDB
          email: newUser.email,
        },
        JWT_TOKEN_KEY,
        { expiresIn: "1h" }
      );
    } catch (err) {
      return next(
        new HttpError(
          `Failed to create new user beacause of ${err.message}`,
          500
        )
      );
    }

    res.status(201).json({
      message: "Successfully added a new user!",
      data: { userId: newUser.id, email: newUser.email, token },
    });
  });

  blobStream.on("error", (error) => {
    console.error(error);
    res.status(500).json({
      message: "File upload failed",
    });
  });

  blobStream.end(file.buffer);
};

const login = async (req, res, next) => {
  console.log(req.body);

  const { email, password } = req.body;

  let userExist;

  try {
    userExist = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      `Cannot find a user with email of ${email}`,
      500
    );
    return next(error);
  }

  if (!userExist) {
    return next(
      new HttpError(
        "Invalid credential, please input correct email and password!",
        403
      )
    );
  }

  let isPasswordValid = false;
  try {
    // Check if password match and return boolean value
    isPasswordValid = await bcrypt.compare(password, userExist.password);
  } catch (err) {
    return next(
      new HttpError(
        `Could not logged you in because ${err.message}, please try again`,
        500
      )
    );
  }

  if (!isPasswordValid) {
    return next(
      new HttpError("Invalid credential, please input correct password!", 403)
    );
  }

  let token;
  try {
    token = jwt.sign(
      { userId: userExist.id, email: userExist.email },
      JWT_TOKEN_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(
      new HttpError(
        `Invalid credential, please input correct username and password!`,
        500
      )
    );
  }

  res.status(200).json({
    message: "Login Success!",
    data: { userId: userExist.id, email: userExist.email, token },
  });
};

exports.getAllUsers = getAllUsers;
exports.signUp = signUp;
exports.login = login;
