const uuid = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const addressToCoordinates = require("../utils/location");

let DUMMY_PLACES = [
  {
    id: "p1",
    title: "Borobudur",
    description:
      "Borobudur is a 9th-century Mahayana Buddhist temple in Magelang Regency, not far from the city of Magelang and the town of Muntilan, in Central Java, Indonesia",
    imageUrl:
      "https://img.okezone.com/content/2022/02/04/337/2542154/mengenal-raja-yang-meratakan-puncak-bukit-demi-membangun-candi-borobudur-thVuwzm6PE.jpg",
    address:
      "Jl. Badrawati, Kw. Borobudur Temple, Borobudur, Kec. Borobudur, Magelang Regency, Central Java",
    coordinates: {
      lat: -7.6060136,
      lng: 110.1984,
    },
    creator: "u1",
  },
  {
    id: "p2",
    title: "National Monument",
    description:
      "The National Monument is a 132 m (433 ft) obelisk in the centre of Merdeka Square, Central Jakarta, symbolizing the fight for Indonesia",
    imageUrl:
      "https://duitologi.com/media/5ZNKKORS9CTWC6NL1O3U74AXK7QT191G00NJNSNXQUKFVRJVSGPSUD9MNZD9RC4N.jpg.1250x660_q85.jpg",
    address:
      "RT.5/RW.2, Gambir, Gambir District, Central Jakarta City, Special Capital Region of Jakarta 10110",
    coordinates: {
      lat: -6.1753871,
      lng: 106.8249588,
    },
    creator: "u2",
  },
];

const getAllPlaces = (req, res, next) => {
  res.json({ DUMMY_PLACES });
};

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const places = DUMMY_PLACES.filter((place) => place.creator === userId);

  if (!places || places.length < 1) {
    throw new HttpError(
      `Could not find place from user with id of ${userId}`,
      404
    );
    // const error = new Error(
    //   `Could not find place from user with id of ${userId}`
    // );
    // error.code = 404;
    // throw error; // or return next (error)
  }
  res.json({ places });
};

const getPlaceByPlaceId = (req, res, next) => {
  const placeId = req.params.pid;
  const selectedPlace = DUMMY_PLACES.find((place) => place.id === placeId);

  if (!selectedPlace) {
    throw new HttpError(`Could not find place with id of ${placeId}`, 404);
    // const error = new Error(`Could not find place with id of ${placeId}`);
    // error.code = 404;
    // return next(error);
  }

  res.json({ selectedPlace });
};

const createPlace = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(
      HttpError(
        `Input value for ${error.errors[0].param} is an ${error.errors[0].msg}`
      )
    );
  }

  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await addressToCoordinates(address);
  } catch (error) {
    return next(error);
  }

  const newPlace = {
    id: uuid.v4(),
    title,
    description,
    address,
    coordinates,
    creator,
  };

  DUMMY_PLACES.push(newPlace);

  res
    .status(201)
    .json({ message: "Successfully created new data!", data: newPlace });
};

const updatePlace = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new HttpError(
      `Input value for ${error.errors[0].param} is an ${error.errors[0].msg}`
    );
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  const updatedPlace = {
    ...DUMMY_PLACES.find((place) => place.id === placeId),
  };

  const placeIndex = DUMMY_PLACES.findIndex((place) => place.id === placeId);

  updatedPlace.title = title;
  updatedPlace.description = description;

  DUMMY_PLACES[placeIndex] = updatedPlace;

  res
    .status(200)
    .json({ message: "Successfully updated a data!", data: updatedPlace });
};

const deletePlace = (req, res, next) => {
  const placeId = req.params.pid;

  const deletedPlace = DUMMY_PLACES.find((place) => place.id === placeId);

  if (!deletePlace) {
    throw new HttpError(`Could not find a place with id of ${placeId}`, 404);
  }

  DUMMY_PLACES = DUMMY_PLACES.filter((place) => place.id !== placeId);

  res
    .status(200)
    .json({ message: "Successfully deleted a data!", data: deletedPlace });
};

exports.getAllPlaces = getAllPlaces;
exports.getPlacesByUserId = getPlacesByUserId;
exports.getPlaceByPlaceId = getPlaceByPlaceId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;