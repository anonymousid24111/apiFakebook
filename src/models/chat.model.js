import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  idofa: String,// id
  idofb: String,
  content: String,
  date: Date,
});

const chat = mongoose.model("chat", chatSchema, "chats");

export default chat;