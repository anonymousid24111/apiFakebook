var express = require("express");
const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);
var bodyParser = require("body-parser");
var Mongoose = require("mongoose");
var user = require("./controllers/user.controller");
var activity = require("./controllers/activity.controller");
var assignment = require("./controllers/assignment.controller");
var calendar = require("./controllers/calendar.controller");
var channel = require("./controllers/channel.controller");
var chat = require("./controllers/chat.controller");
var file = require("./controllers/file.controller");
var history = require("./controllers/history.controller");
var message = require("./controllers/message.controller");
var post = require("./controllers/post.controller");
var react = require("./controllers/react.controller");
var team = require("./controllers/team.controller");
var search = require("./controllers/search.controller");
var cookieParser = require("cookie-parser");
var jwt = require("jsonwebtoken");
var port = 3000;
server.listen(port);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var useronline = [];
const channels = {};
const sockets = {};
io.on("connection", (socket) => {
  console.log(socket.id + ": connected");
  socket.channels = {};
  sockets[socket.id] = socket;
  socket.on("connectto", (data) => {
    var { userid, username } = data;
    socket.join(data.userid);
    var isconnect = false;
    useronline.forEach((element) => {
      if (element.userid === data.userid) {
        console.log("da connect");
        isconnect = true;
      }
    });
    if (!isconnect) {
      useronline.push({
        userid: userid,
        username: username,
        socketid: socket.id,
      });
      console.log(`userid is ${data.userid} connected`);
    }
  });
  socket.on("useronline", () => {
    io.emit("useronline", useronline);
  });
  socket.on("message", (data) => {
    console.log(data.receiver);
    io.to(data.receiver[0]._id).to(data.receiver[1]._id).emit("message", data);
  });
  socket.on("disconnect", () => {
    for (const channel in socket.channels) {
      part(channel);
    }
    delete sockets[socket.id];
    for (let index = 0; index < useronline.length; index++) {
      if (useronline) {
        if (useronline[index].socketid === socket.id) {
          useronline.splice(index, 1);
          break;
        }
      }
    }
    console.log("Client disconnected");
  });
});
