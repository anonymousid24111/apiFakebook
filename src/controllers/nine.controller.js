const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");

const User = require("../models/user.model.js");

const statusCode = require("../constants/statusCode.constant.js");
const statusMessage = require("../constants/statusMessage.constant.js");
const md5 = require("md5");

const getRequestedFriends = async (req, res) => {
  const { token, index, count } = req.query;
  try {
    var userData = await User.findById(_id).populate({
      path: "requestedFriends",
      select: "_id username avatar",
    });
    Promise.all(
      userData.requestedFriends.map((element) => {
        return sameFriendsHelper.sameFriends(userData.friendIds, element._id);
      })
    )
      .then((result) => {
        console.log(result);
        userData.requestedFriends.map((value, index) => {
          return {
            value,
            same_friends: result[index],
          };
        });
        return res.status(200).json({
          code: statusCode.OK,
          message: statusMessage.OK,
          data: {
            request: userData.requestedFriends,
            total: 0,
          },
        });
      })
      .catch((e) => {
        return res.status(200).json({
          code: statusCode.UNKNOWN_ERROR,
          message: statusMessage.UNKNOWN_ERROR,
        });
      });
  } catch (error) {
    return res.status(500).json({
      code: statusCode.UNKNOWN_ERROR,
      message: statusMessage.UNKNOWN_ERROR,
    });
  }
};

const change_password = async (req, res) => {
  let { token, password, new_password } = req.query;
  const { _id } = req.jwtDecoded.data;
  try {
    const user = await User.findById(_id);
    if (!new_password ||
      new_password.length < 6 ||
      new_password.length > 10 ||
      new_password.match(/[^a-z|A-Z|0-9]/g))
      throw Error("NEW_PASSWORD_VALUE_IS_INVALID");


    if (password == new_password)
      throw Error("PARAMETER_VALUE_IS_INVALID")

    let count = 0;
    // chưa check xâu con chung dài nhất 80%

    password = md5(password)
    if (password != user.password)
      throw Error("OLD_PASSWORD_VALUE_IS_INVALID");

    //đã thoả mãn các điều kiện

    new_password = md5(new_password);
    user.password = new_password;
    await user.save();

    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
    });


  } catch (error) {
    console.log(error.message);
    if (error.message == "PARAMETER_VALUE_IS_INVALID")
      return res.status(200).json({
        code: statusCode.PARAMETER_VALUE_IS_INVALID,
        message: statusMessage.PARAMETER_VALUE_IS_INVALID
      });
    else if (error.message == "OLD_PASSWORD_VALUE_IS_INVALID")
      return res.status(200).json({
        code: statusCode.PARAMETER_VALUE_IS_INVALID,
        message: "OLD_PASSWORD_VALUE_IS_INVALID"
      });
    else if (error.message == "NEW_PASSWORD_VALUE_IS_INVALID")
      return res.status(200).json({
        code: statusCode.PARAMETER_VALUE_IS_INVALID,
        message: "NEW_PASSWORD_VALUE_IS_INVALID"
      });
    else return res.status(200).json({
      code: statusCode.UNKNOWN_ERROR,
      message: statusMessage.UNKNOWN_ERROR,
    });

  }


}

module.exports = {
  change_password: change_password
};
