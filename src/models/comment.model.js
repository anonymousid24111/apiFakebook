const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  author: String,// id
  content: String,
  date: Date,
});

const comment = mongoose.model("comment", commentSchema);

module.exports = comment;
