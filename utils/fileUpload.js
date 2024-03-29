const multer = require("multer");
const path = require("path");
const FTPStorage = require("multer-ftp");

// const fileStorageEngine = multer.diskStorage({
//   destination: (req, file, callback) => {
//     callback(null, path.join("public", "uploads"));
//   },
//   filename: (req, file, callback) => {
//     callback(null, Date.now() + path.extname(file.originalname));
//   },
// });

const upload = multer({
  storage: new FTPStorage({
    ftp: {
      host: process.env.MEDIA_URL,
      // secure: false, // enables FTPS/FTP with TLS
      user: process.env.MEDIA_USER,
      password: process.env.MEDIA_PASSWORD,
    },
  }),
  fileFilter: (req, file, cb) => {
    const mediaType = getMediaType(file);
    if (mediaType !== -1) {
      file.mediaType = mediaType;
      cb(null, true);
    } else {
      cb(null, false);
      return cb(
        new Error("Only .png, .jpg, .jpeg, video and audio format allowed!")
      );
    }
  },
});

const getMediaType = (file) => {
  switch (file.mimetype) {
    case "image/png":
    case "image/jpg":
    case "image/jpeg":
      return 0;
    case "video":
      return 1;
    case "audio":
      return 2;
    default:
      return -1;
  }
};

//https://www.positronx.io/multer-file-type-validation-tutorial-with-example/

module.exports = upload;
