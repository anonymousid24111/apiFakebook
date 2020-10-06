import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import formidable from "formidable";
import fs from "fs";
// import cookieParser from 'cookie-parser'
import mongoose from "mongoose";
mongoose.connect(process.env.MONGO_URL || "mongodb://localhost/apiFakebook", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

import userRoute from "./src/routes/user.route.mjs";
import authRoute from "./src/routes/auth.route.mjs";
import postRoute from "./src/routes/post.route.mjs";

import authMiddleware from "./src/middlewares/auth.middleware.mjs";

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
    console.log(files.filetoupload)
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
