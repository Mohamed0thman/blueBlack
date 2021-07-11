const multer = require("multer");
const uuid = require("uuid").v4;
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./upload");
  },
  filename: function (req, file, cb) {
    console.log("file", file);
    const ext = path.extname(file.originalname);
    const id = uuid();
    const filePath = `images/${id}${ext}`;
    cb(null, filePath);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(png|jpg)$/)) {
    return cb(new Error("upload png"));
  }

  cb(undefined, true);
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 },
  fileFilter: fileFilter,
});

module.exports = upload;
