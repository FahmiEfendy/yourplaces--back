const uuid = require("uuid");
const multer = require("multer");
const admin = require("firebase-admin");

var serviceAccount = require("../yourplaces-back-firebase-adminsdk-fynmo-a5adfc9b20.json");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://yourplaces-back.appspot.com",
});

const storage = admin.storage();

// const fileUpload = multer({
//   limits: 500000, // 5 MB
//   storage: multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, "uploads/images"); // saved image will be stored in this folder
//     },
//     filename: (req, file, cb) => {
//       const ext = MIME_TYPE_MAP[file.mimetype]; // Check File Type
//       cb(null, uuid.v4() + "." + ext); // Define Filename
//     },
//   }),

//   fileFilter: (req, file, cb) => {
//     const isValid = !!MIME_TYPE_MAP[file.mimetype]; // Check if there is matches mime type (return true or false)
//     let error = isValid ? null : new Error("Invalid MIME Type!");
//     cb(error, isValid);
//   },
// });

const fileUpload = multer({
  limits: {
    fileSize: 500000, // 5 MB limit
  },
  storage: multer.memoryStorage({}), // Store files in memory for processing
  fileFilter: (req, file, cb) => {
    const ext = MIME_TYPE_MAP[file.mimetype];
    if (!ext) {
      cb(new Error("Invalid MIME Type!"), false);
    } else {
      cb(null, true);
    }
  },
});

module.exports = { fileUpload, storage };
