require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const formidable = require("formidable");
const fs = require("fs");
// const ThumbnailGenerator = require('video-thumbnail-generator').default;
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
// const cookieParser = require( 'cookie-parser'
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URL || "mongodb://localhost/ungdungdanentang", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false,
});

const userRoute = require("./src/routes/user.route.js");
const authRoute = require("./src/routes/auth.route.js");
const postRoute = require("./src/routes/post.route.js");
const sixRoute = require("./src/routes/six.route.js");
const sevenRoute = require("./src/routes/seven.route.js");
const eightRoute = require("./src/routes/eight.route.js");
const nineRoute = require("./src/routes/nine.route.js");
const tenRoute = require("./src/routes/ten.route.js");
const elevenRoute = require("./src/routes/eleven.route.js");

const authMiddleware = require("./src/middlewares/auth.middleware.js");
const { OK } = require("./src/constants/statusCode.constant.js");

const port = process.env.PORT || 3000;
const firstParamsRoute = process.env.FIRST_PARAMS_ROUTE || "it4788";

const app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.all("/", (req, res) => {
  res.status(200).json({
    code: 1000,
    message: OK
  })
});

app.post("/fileupload", (req, res) => {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    // console.log(files.filetoupload, fields)
    var oldpath = files.filetoupload.path;
    var newpath = "upload/" + files.filetoupload.name;
    var proc = ffmpeg(oldpath).on('filenames', function(filenames) {
      console.log('Will generate ' + filenames.join(', '))
    })
    .on('end', function() {
      console.log('Screenshots taken');
    })
    .screenshots({
      // Will take screens at 20%, 40%, 60% and 80% of the video
      count: 4,
      folder: '/upload'
    });
    console.log(proc)
    // fs.rename(oldpath, newpath, function (err) {
    //   if (err) throw err;
      res.write("File uploaded and moved!");
      return res.end();
    // });
  });
});

app.use(`/${firstParamsRoute}`, authRoute);
app.use(`/${firstParamsRoute}`, authMiddleware.isAuth, userRoute);
app.use(`/${firstParamsRoute}`, authMiddleware.isAuth, postRoute);
app.use(`/${firstParamsRoute}`, authMiddleware.isAuth, sixRoute);
app.use(`/${firstParamsRoute}`, authMiddleware.isAuth, sevenRoute);
app.use(`/${firstParamsRoute}`, authMiddleware.isAuth, eightRoute);
app.use(`/${firstParamsRoute}`, authMiddleware.isAuth, nineRoute);
app.use(`/${firstParamsRoute}`, authMiddleware.isAuth, tenRoute);
app.use(`/${firstParamsRoute}`, authMiddleware.isAuth, elevenRoute);

app.listen(port, function () {
  console.log("Server listening on port " + port);
});
