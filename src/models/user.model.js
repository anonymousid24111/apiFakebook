const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new mongoose.Schema({
  phonenumber: String,
  username: String,
  password: String,
  avatar: String,
  token: String,
  is_blocked: String,
  requestedFriends: [{
    type: Schema.Types.ObjectId,
    ref: "user"
  }],
  postIds: [{
    type: Schema.Types.ObjectId,
    ref: "post"
  }],
  blockedIds: [{
    type: Schema.Types.ObjectId,
    ref: "user"
  }],
  savedSearch: [{
    keyword: String,
    created: Date,
  }],
  active: Number,
  friends: [{
    type: Schema.Types.ObjectId,
    ref: "user"
  }],
});

const User = mongoose.model("user", userSchema);

module.exports = User;
