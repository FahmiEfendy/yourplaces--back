const uuid = require("uuid");
const multer = require("multer");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
};

const fileUpload = multer({
  limits: 500000, // 5 MB
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/images"); // saved image will be stored in this folder
    },
    filename: (req, file, cb) => {
      const ext = MIME_TYPE_MAP[file.mimetype]; // Check File Type
      cb(null, uuid.v4() + "." + ext); // Define Filename
    },
  }),

  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype]; // Check if there is matches mime type (return true or false)
    let error = isValid ? null : new Error("Invalid MIME Type!");
    cb(error, isValid);
  },
});

module.exports = fileUpload;
