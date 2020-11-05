const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new mongoose.Schema({
  phonenumber: String,
  username: String,
  password: String,
  avatar: String,
  token: String,
  is_blocked: String,
  blockedIds: [{
    type: Schema.Types.ObjectId,
    ref: "user"
  }],
  active: Number,
  friends: [{
    type: Schema.Types.ObjectId,
    ref: "user"
  }],
});

const User = mongoose.model("user", userSchema);

module.exports = User;
