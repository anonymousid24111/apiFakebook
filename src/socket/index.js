const Chat = require("../models/chat.model");


chats=[];
rooms=[]

const init = (socket) => {
    console.log("A user connected:" + socket.id);
    socket.on("joinchat", function (data) {
      socket.join(data._id);
      rooms.push(data._id);
      // console.log(socket.rooms, rooms);
      socket.emit("joinedchat", {
        _id: data._id,
        chats: chats.filter((e) => e.room == data._id),
      });
    });
    socket.on("reconnecting", (data) => {
      console.log("client dang tao lai ket noi");
    });
    socket.on("send", async (data) => {
      chats.push(data);
      try {
        await Chat.findByIdAndUpdate(data.conversation_id, {
          $push: {
            conversation: {
              message: data.message,
              unread: "1",
              created: Date.now(),
              sender: data.sender,
            },
          },
        });
      } catch (error) {
        console.log("loi updata Chat");
      } finally{
        io.to(data.receiver).emit("onmessage", {
          sender: data.sender,
          conversation_id: data.conversation_id,
          receiver: data.receiver,
          message: data.message,
        });
      }
  
    });
    socket.on("deletemessage",async (data) => {
      console.log("client xoa tin nhan");
      try {
        await Chat.findByIdAndUpdate(data.conversation_id, {
          $pull: {
            conversation: {
              _id: data.message_id
            },
          },
        });
      } catch (error) {
        console.log("loi updata Chat");
      } finally{
        io.to(data.receiver).emit("onmessage", {
          sender: data.sender,
          conversation_id: data.conversation_id,
          receiver: data.receiver,
          message: "Tin nhắn đã bị xoá",
        });
      }
    });
    socket.on("disconnect", (data) => {
      console.log("client ngat ket noi");
    });
  }
module.exports = {
    init,
};