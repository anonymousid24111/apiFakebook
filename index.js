require("dotenv").config();

const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const bodyParser = require("body-parser");
const formidable = require("formidable");
const fs = require("fs");
// const ThumbnailGenerator = require('video-thumbnail-generator').default;
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
// const cookieParser = require( 'cookie-parser'
const mongoose = require("mongoose");
mongoose.connect(
  process.env.MONGO_URL || "mongodb://localhost/ungdungdanentang",
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
  }
);

const userRoute = require("./src/routes/user.route.js");
const authRoute = require("./src/routes/auth.route.js");
const postRoute = require("./src/routes/post.route.js");
const sixRoute = require("./src/routes/six.route.js");
const sevenRoute = require("./src/routes/seven.route.js");
const eightRoute = require("./src/routes/eight.route.js");
const nineRoute = require("./src/routes/nine.route.js");
const tenRoute = require("./src/routes/ten.route.js");
const elevenRoute = require("./src/routes/eleven.route.js");
const bonusRoute = require("./src/routes/bonus.route.js");

const authMiddleware = require("./src/middlewares/auth.middleware.js");
const { OK } = require("./src/constants/statusCode.constant.js");
const Chat = require("./src/models/chat.model.js");

const port = process.env.PORT || 3000;
const firstParamsRoute = process.env.FIRST_PARAMS_ROUTE || "it4788";

// const app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.all("/", (req, res) => {
  res.status(200).json({
    code: 1000,
    message: OK,
  });
});

app.post("/fileupload", (req, res) => {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    // console.log(files.filetoupload, fields)
    var oldpath = files.filetoupload.path;
    var newpath = "upload/" + files.filetoupload.name;
    var proc = ffmpeg(oldpath)
      .on("filenames", function (filenames) {
        console.log("Will generate " + filenames.join(", "));
      })
      .on("end", function () {
        console.log("Screenshots taken");
      })
      .screenshots({
        // Will take screens at 20%, 40%, 60% and 80% of the video
        count: 4,
        folder: "/upload",
      });
    console.log(proc);
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
app.use(`/${firstParamsRoute}`, authMiddleware.isAuth, bonusRoute);

// test socket
app.get("/testsocket", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
useronlines = [];
chats = [];
io.on("connection", function (socket) {
  console.log("A user connected:" + socket.id);
  socket.on("joinchat", function (data) {
    socket.join(data._id);
    useronlines.push(data._id);
    // console.log(socket.useronlines, useronlines);
    socket.emit("joinedchat", {
      room: data._id,
      // chats: chats.filter((e) => e.room == data.room),
    });
  });
  socket.on("reconnecting", (data) => {
    console.log("client dang tao lai ket noi");
  });
  socket.on("send", async ({sender, receiver, message_id, created, content, conversation_id})=> {
    await Chat.findByIdAndUpdate(conversation_id, {
      $push: {
        conversation: {
          message: content,
          unread: "1",
          created: Date.now(),
          sender: sender
        }
      }
    })
    io.to(receiver).emit("onmessage", {
      sender: sender,
      receiver: receiver,
      content: content,
      created: Date.now()
    });
  });
  socket.on("deletemessage",async ({sender, receiver, message_id, created, content, conversation_id})=>{
    await Chat.findByIdAndUpdate(_id, {
      $push:{
        conversation: {
          _id: message_id
        }
      }
    });
    io.to(receiver).emit("ondeletemessage", {
      sender: sender,
      receiver: receiver,
      message_id: message_id,
    });
  })
  socket.on("disconnect", data=>{
    console.log("client ngat ket noi")
  })
});

server.listen(port);
// app.listen(port, function () {
//   console.log("Server listening on port " + port);
// });
