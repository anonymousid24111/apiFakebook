import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  phonenumber: String,
  username: String,
  password: String,
  avatar: String,
  token: String,
  blockedIds: Array,
  active: Number
});

const User = mongoose.model("User", userSchema, "users");

export default User;
