const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new mongoose.Schema({
  described: String,
  created: Date,
  modified: Date,
  like: Number,
  comment: Number,
  is_liked: Boolean,
  image: [{
    id:  Schema.Types.ObjectId,
    url: String,
  }],
  video: {
    id:  Schema.Types.ObjectId,
    url: String,
  },
  // 
  author: { type: Schema.Types.ObjectId, ref: 'user' },
  state: String,
  is_blocked: String,
  can_edit: String,
  banned: String,
  can_comment: String,
  // url: String,
  // messages: Array,
});

const post = mongoose.model("post", postSchema);

module.exports = post;
