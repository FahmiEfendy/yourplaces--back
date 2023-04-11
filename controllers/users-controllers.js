const uuid = require("uuid");
const { validationResult } = require("express-validator");

const User = require("../models/user");

const HttpError = require("../models/http-error");

// const DUMMY_USERS = [
//   {
//     id: "u1",
//     name: "Max Schwarz",
//     image:
//       "https://images.pexels.com/photos/839011/pexels-photo-839011.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
//     places: 3,
//   },
//   {
//     id: "u2",
//     name: "Fahmi Efendy",
//     image:
//       "https://wallpapers-clan.com/wp-content/uploads/2022/07/funny-cat-9.jpg",
//     places: 1,
//   },
// ];
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

const signUp = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new HttpError(
      `Input value for ${error.errors[0].param} is an ${error.errors[0].msg}`
    );
  }

  const { name, email, password } = req.body;

  const userExist = DUMMY_USERS.find((user) => user.email === email);

  if (userExist) {
    throw new HttpError(`User with email of ${email} already exist!`, 422);
  }

  const newUser = {
    id: uuid.v4(),
    name,
    email,
    password,
  };

  DUMMY_USERS.push(newUser);

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
