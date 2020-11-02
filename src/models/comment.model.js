const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  poster: { type: Schema.Types.ObjectId, ref: 'user' },// id
  author: { type: Schema.Types.ObjectId, ref: 'user' },
  content: String,
  date: Date,
});

const comment = mongoose.model("comment", commentSchema);

module.exports = comment;
