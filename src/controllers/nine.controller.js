const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");

const User = require("../models/user.model.js");

const statusCode = require("../constants/statusCode.constant.js");
const statusMessage = require("../constants/statusMessage.constant.js");
const md5 = require("md5");

const setBlock = async (req, res) => {
  const { token, user_id, type } = req.query;
  const { _id } = req.jwtDecoded.data;

  try {
    //kiểm tra tham số đầu vào
    if (user_id == _id || (type != 0 && type != 1)) {
      console.log("trùng user_id hoặc type không đúng");
      throw Error("params");
    }
    // tìm user bị block
    var friendData = await User.findById(user_id);
    if (!friendData || friendData.is_blocked) {
      console.log("friend không tìm thấy hoặc đã bị server block");
      throw Error("action");
    }
    // OK
    var userData = await User.findById(_id);
    var isBlocked = userData.blockedIds.includes(user_id);
    if (type == 0 && isBlocked) {
      //block và đã block r
      throw Error("blockedbefore");
    }
    if (type == 0 && !isBlocked) {
      await User.findById(_id, {
        $push: {
          blockedIds: user_id,
        },
        $pull: {
          friends: user_id,
        },
      });
      await User.findById(user_id, {
        $pull: {
          friends: _id,
        },
      });
      return res.status(200).json({
        code: statusCode.OK,
        message: statusMessage.OK,
      });
    }
    if (type == 1 && !isBlocked) {
      // unblock và chưa block
      throw Error("unblockedbefore");
    }
    if (type == 1 && isBlocked) {
      await User.findById(_id, {
        $pull: {
          blockedIds: user_id,
        },
      });
      return res.status(200).json({
        code: statusCode.OK,
        message: statusMessage.OK,
      });
    }
  } catch (error) {
    if (error.massage == "params") {
      return res.status(500).json({
        code: statusCode.PARAMETER_VALUE_IS_INVALID,
        message: statusMessage.PARAMETER_VALUE_IS_INVALID,
      });
    } else if (
      error.massage == "blockedbefore" ||
      error.message == "unblockedbefore"
    ) {
      return res.status(500).json({
        code: statusCode.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
        message: statusMessage.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
      });
    } else if (error.massage == "action") {
      return res.status(500).json({
        code: statusCode.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
        message: statusMessage.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
      });
    } else {
      return res.status(500).json({
        code: statusCode.UNKNOWN_ERROR,
        message: statusMessage.UNKNOWN_ERROR,
      });
    }
  }
};

const change_password = async (req, res) => {
  let { token, password, new_password } = req.query;
  const { _id } = req.jwtDecoded.data;
  try {
    const user = await User.findById(_id);
    if (
      !new_password ||
      new_password.length < 6 ||
      new_password.length > 10 ||
      new_password.match(/[^a-z|A-Z|0-9]/g)
    )
      throw Error("NEW_PASSWORD_VALUE_IS_INVALID");

    if (password == new_password) throw Error("PARAMETER_VALUE_IS_INVALID");

    let count = 0;
    // chưa check xâu con chung dài nhất 80%

    password = md5(password);
    if (password != user.password) throw Error("OLD_PASSWORD_VALUE_IS_INVALID");

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
        message: statusMessage.PARAMETER_VALUE_IS_INVALID,
      });
    else if (error.message == "OLD_PASSWORD_VALUE_IS_INVALID")
      return res.status(200).json({
        code: statusCode.PARAMETER_VALUE_IS_INVALID,
        message: "OLD_PASSWORD_VALUE_IS_INVALID",
      });
    else if (error.message == "NEW_PASSWORD_VALUE_IS_INVALID")
      return res.status(200).json({
        code: statusCode.PARAMETER_VALUE_IS_INVALID,
        message: "NEW_PASSWORD_VALUE_IS_INVALID",
      });
    else
      return res.status(200).json({
        code: statusCode.UNKNOWN_ERROR,
        message: statusMessage.UNKNOWN_ERROR,
      });
  }
};

module.exports = {
  change_password: change_password,
  setBlock,
};
