require("dotenv").config();

const express = require( "express");
const bodyParser = require( "body-parser");
const formidable = require( "formidable");
const fs = require( "fs");
// const cookieParser = require( 'cookie-parser'
const mongoose = require( "mongoose");
mongoose.connect(process.env.MONGO_URL || "mongodb://localhost/apiFakebook", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

const userRoute = require( "./src/routes/user.route.js");
const authRoute = require( "./src/routes/auth.route.js");
const postRoute = require( "./src/routes/post.route.js");

const authMiddleware = require( "./src/middlewares/auth.middleware.js");

const port = process.env.PORT || 3000;
const firstParamsRoute = process.env.FIRST_PARAMS_ROUTE || "it4788";

const app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get("/testfile", (req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write(
    '<form action="fileupload" method="post" enctype="multipart/form-data">'
  );
  res.write('<input type="file" name="filetoupload"><br>');
  res.write('<input type="submit">');
  res.write("</form>");
  return res.end();
});

app.post("/fileupload", (req, res) => {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    console.log(files.filetoupload, fields)
    var oldpath = files.filetoupload.path;
    var newpath = "upload/" + files.filetoupload.name;
    fs.rename(oldpath, newpath, function (err) {
      if (err) throw err;
      res.write("File uploaded and moved!");
      return res.end();
    });
  });
});

app.use(`/${firstParamsRoute}`, authRoute);
app.use(`/${firstParamsRoute}`, authMiddleware.isAuth, userRoute);
app.use(`/${firstParamsRoute}`, authMiddleware.isAuth, postRoute);

app.listen(port, function () {
  console.log("Server listening on port " + port);
});
