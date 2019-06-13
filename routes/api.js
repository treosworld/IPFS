const ipfsAPI = require("ipfs-api");
const route = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const ipfs = ipfsAPI("ipfs.infura.io", "5001", { protocol: "https" });

let testFile, testBuffer;
let validCID = null;

const handleError = (err, res) => {
  res
    .status(500)
    .contentType("text/plain")
    .end("Oops! Something went wrong!");
};

const upload = multer({
  dest: "/path/to/temporary/directory/to/store/uploaded/files"
});

function AddFile() {
  return new Promise(function(resolve, reject) {
    testBuffer = new Buffer.from(testFile);
    ipfs.files.add(testBuffer, function(err, file) {
      if (err) {
        console.log(err);
      }
      validCID = file[0].hash;
      console.log(validCID);
      resolve();
    });
  });
}

route.get("/image.png", (req, res) => {
  res.sendFile(path.join(__dirname, "./uploads/image.png"));
});

route.get("/", function(req, res) {
  res.sendFile("index.html"); //if html file is within public directory
});

route.get("/getUploadedfile", (req, res) => {
  res.send(validCID);
});

route.get("/DeleteImage", (req, res) => {
  validCID = null;
  res.send(validCID);
});

route.post(
  "/upload",
  upload.single("file" /* name attribute of <file> element in your form */),
  (req, res) => {
    if (req.file != undefined) {
      const tempPath = req.file.path;
      if (path.extname(req.file.originalname).toLowerCase() === ".png") {
        testFile = fs.readFileSync(tempPath);
        AddFile()
          .then(() => {
            res.send(validCID);
          })
          .catch(err => res.send({ error: err }));
      } else {
        fs.unlink(tempPath, err => {
          if (err) return handleError(err, res);

          res
            .status(403)
            .contentType("text/plain")
            .end("Only .png files are allowed!");
        });
      }
    } else res.send("No File chosen");
  }
);

exports = module.exports = {
  route
};