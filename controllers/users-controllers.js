const { validationResult } = require("express-validator");

const User = require("../models/user");

const HttpError = require("../models/http-error");

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
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(
      new HttpError(
        `Input value for ${error.errors[0].param} is an ${error.errors[0].msg}`
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

  const newUser = new User({
    name,
    email,
    image: "https://wallpapers.com/images/featured/v24i6v24vmtk4ygu.jpg",
    password,
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

  res
    .status(201)
    .json({
      message: "Successfully added a new user!",
      data: newUser.toObject({ getters: true }),
    });
};

const login = async (req, res, next) => {
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

  if (!userExist || userExist.password !== password) {
    return next(
      new HttpError(
        "Invalid credential, please input correct email and password!",
        401
      )
    );
  }

  res.status(200).json({ message: "Login Success!" });
};

exports.getAllUsers = getAllUsers;
exports.signUp = signUp;
exports.login = login;
