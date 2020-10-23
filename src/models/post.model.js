import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  described: String,
  created: Date,
  modified: Date,
  like: Number,
  comment: Number,
  is_liked: Number,
  image: Array,
  video: {
    url: String,
    thumb: String,
  },
  // 
  author: {
    //type: Object
    id: String,
    name: String,
    avatar: String,
    online: String,
  },
  state: String,
  is_blocked: String,
  can_edit: String,
  banned: String,
  can_comment: String,
  url: String,
  messages: Array,
});

const post = mongoose.model("post", postSchema, "posts");

export default post;
