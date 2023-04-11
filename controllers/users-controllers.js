const uuid = require("uuid");
const { validationResult } = require("express-validator");

const User = require("../models/user");

const HttpError = require("../models/http-error");

const DUMMY_USERS = [
  {
    id: "u1",
    name: "Max Schwarz",
    email: "max_schwarz@gmail.com",
    password: "max_schwarz",
  },
  {
    id: "u2",
    name: "Fahmi Efendy",
    email: "fahmi_efendy@gmail.com",
    password: "fahmi_efendy",
  },
];

const getAllUsers = (req, res, next) => {
  res.json({ DUMMY_USERS });
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

  const { name, email, password, places } = req.body;

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
    places,
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
    .json({ message: "Successfully added a new user!", data: newUser });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  const loginUser = DUMMY_USERS.find((user) => user.email === email);

  if (!loginUser) {
    throw new HttpError(`Cannot find an user with email of ${email}`, 401);
  } else if (loginUser.password !== password) {
    throw new HttpError(
      `Password does not match with user with email of ${email}`,
      401
    );
  }

  res.status(200).json({ message: "Successfull login!" });
};

exports.getAllUsers = getAllUsers;
exports.signUp = signUp;
exports.login = login;
