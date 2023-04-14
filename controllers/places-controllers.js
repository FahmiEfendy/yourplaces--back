const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

const User = require("../models/user");
const Place = require("../models/place");
const HttpError = require("../models/http-error");
const addressToCoordinates = require("../utils/location");

const getAllPlaces = async (req, res, next) => {
  let result;

  try {
    result = await Place.find();
  } catch (err) {
    const error = new HttpError(
      `Failed to get all data because of ${err.message}`,
      500
    );
    return next(error);
  }

  res.status(200).json({
    message: "Successfully get all places from database!",
    data: result,
  });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let userWithPlaces;

  try {
    userWithPlaces = await User.findById(userId).populate("places");
  } catch (err) {
    const error = new HttpError(
      `Failed to get all places from user with id of ${userId} because of ${err.message}`,
      500
    );
    return next(error);
  }

  if (!userWithPlaces || userWithPlaces.places.length < 1) {
    const error = new HttpError(
      `User with user id of ${userId} dont have a place!`,
      404
    );

    return next(error);
  }

  res.status(200).json({
    message: `Successfully get all place from user with id of ${userId}`,
    // data: userWithPlaces.places.map((place) =>
    //   place.toObject({ getters: true })
    // ),
    data: userWithPlaces.toObject({ getters: true }),
  });
};

const getPlaceByPlaceId = async (req, res, next) => {
  const placeId = req.params.pid;

  let selectedPlace;

  try {
    selectedPlace = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      `Failed to get a place with id of ${placeId} because of ${err.message}`,
      500
    );
    return next(error);
  }

  if (!selectedPlace) {
    const error = new HttpError(`There is no place with id of ${placeId}`, 404);
    return next(error);
  }

  // getters:true = add ID (String) property to object
  res.json({
    message: `Successfully get a place with id of ${placeId}`,
    data: selectedPlace.toObject({ getters: true }),
  });
};

const createPlace = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(
      new HttpError(
        `Input value for ${error.errors[0].param} is an ${error.errors[0].msg}`
      )
    );
  }

  const { title, description, address, creator } = req.body;

  let coordinates;
  let user;

  try {
    coordinates = await addressToCoordinates(address);
  } catch (error) {
    return next(error);
  }

  const newPlace = new Place({
    title,
    description,
    image:
      "https://img.okezone.com/content/2022/02/04/337/2542154/mengenal-raja-yang-meratakan-puncak-bukit-demi-membangun-candi-borobudur-thVuwzm6PE.jpg",
    address,
    coordinates,
    creator,
  });

  try {
    user = await User.findById(creator);
  } catch (err) {
    return next(
      new HttpError(
        `Failed to find a user with id of ${creator} because of ${err.message}`
      ),
      500
    );
  }

  if (!user) {
    return next(new HttpError(`There is no user with id of ${creator}`, 404));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await newPlace.save({ session: sess }); // Activate Session
    user.places.push(newPlace); // Add newPlace to user
    await user.save({ session: sess }); // Activate Session
    await sess.commitTransaction(); // Run changes from activated session
  } catch (err) {
    const error = new HttpError(
      `Failed to created new data because of ${err.message}`,
      500
    );
    return next(error);
  }

  res.status(201).json({
    message: "Successfully created new data!",
    data: newPlace.toObject({ getters: true }),
  });
};

const updatePlace = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(
      HttpError(
        `Input value for ${error.errors[0].param} is an ${error.errors[0].msg}`
      )
    );
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let selectedPlace;

  try {
    selectedPlace = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      `Failed to get a place with id of ${placeId} because of ${err.message}`,
      500
    );
    return next(error);
  }

  if (!selectedPlace) {
    const error = new HttpError(`There is no place with id of ${placeId}`, 404);
    return next(error);
  }

  selectedPlace.title = title;
  selectedPlace.description = description;

  try {
    await selectedPlace.save();
  } catch (err) {
    const error = new HttpError(
      `Failed to update a place with id of ${placeId} because of ${err.message}`,
      500
    );
    return next(error);
  }

  res.status(200).json({
    message: "Successfully updated a data!",
    data: selectedPlace.toObject({ getters: true }),
  });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let selectedPlace;
  let user;

  try {
    // populate(): Expand property creator in place
    selectedPlace = await Place.findById(placeId).populate("creator");
  } catch (err) {
    const error = new HttpError(
      `Failed to get a place with id of ${placeId} because of ${err.message}`,
      500
    );
    return next(error);
  }

  if (!selectedPlace) {
    const error = new HttpError(`There is no place with id of ${placeId}`, 404);
    return next(error);
  }

  try {
    user = await User.findById(selectedPlace.creator.id);
  } catch (err) {
    return next(
      new HttpError(
        `Failed to find a user with id of ${creator} because of ${err.message}`
      ),
      500
    );
  }

  if (!user) {
    return next(new HttpError(`There is no user with id of ${creator}`, 404));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await selectedPlace.deleteOne({ session: sess }); // Delete a place
    selectedPlace.creator.places.pull(selectedPlace);
    await selectedPlace.creator.save({ session: sess }); // Delete a place from user
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      `Failed to delete a place with id of ${placeId} because of ${err.message}`,
      500
    );
    return next(error);
  }

  res
    .status(200)
    .json({ message: "Successfully deleted a data!", data: selectedPlace });
};

exports.getAllPlaces = getAllPlaces;
exports.getPlacesByUserId = getPlacesByUserId;
exports.getPlaceByPlaceId = getPlaceByPlaceId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
