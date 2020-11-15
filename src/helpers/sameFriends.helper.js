require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/user.model");
let sameFriends = (friends , user_id) => {
  return new Promise(async(resolve, reject) => {
    var result = await User.findById(user_id);
    var count = 0 ;
    result.friendIds.forEach(element => {
      if (friends.includes(element)) {
        count++;
      }
    });
    return resolve(count);
  });
};
module.exports = {
  sameFriends: sameFriends,
};
