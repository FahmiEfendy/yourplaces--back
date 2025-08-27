const Busboy = require("busboy");
const admin = require("firebase-admin");

const serviceAccount = require("../yourplaces-back-firebase-adminsdk-fynmo-a5adfc9b20.json");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "yourplaces-back.appspot.com",
});

const storage = admin.storage();

const fileUploadMiddleware = (req, res, next) => {
  if (
    !req.headers["content-type"] ||
    req.headers["content-type"].indexOf("multipart/form-data") !== 0
  ) {
    return next();
  }

  const busboy = new Busboy({ headers: req.headers });

  const buffers = [];
  let formData = {};
  let fileName = "";
  let filePath = "";

  busboy.on("field", (fieldname, val) => {
    formData[fieldname] = val;
  });

  busboy.on("file", (fieldname, file, originalname, encoding, mimetype) => {
    const ext = MIME_TYPE_MAP[mimetype];
    if (!ext) {
      return res.status(400).json({ error: "Invalid File Type!" });
    }

    const buffer = [];

    file.on("data", (data) => {
      buffer.push(data);
    });

    file.on("end", () => {
      buffers.push(Buffer.concat(buffer));
      fileName = originalname;
      filePath = formData.address ? "places" : "users";
    });
  });

  busboy.on("finish", () => {
    req.body = formData;
    req.file = {
      originalname: `${filePath}/${fileName}`,
      buffer: Buffer.concat(buffers),
    };
    next();
  });

  req.pipe(busboy);
};

module.exports = { fileUploadMiddleware, storage };
