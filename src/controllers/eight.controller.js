const dotenv = require("dotenv");
dotenv.config();
const fs = require("fs");
const formidable = require("formidable");
const { getVideoDurationInSeconds } = require("get-video-duration");
const mongoose = require("mongoose");

const Post = require("../models/post.model.js");
const User = require("../models/user.model.js");
const Request = require("../models/request.model.js");

const ReportPost = require("../models/report.post.model.js");
const Comment = require("../models/comment.model");

const sameFriendsHelper = require("../helpers/sameFriends.helper.js");

const statusCode = require("../constants/statusCode.constant.js");
const statusMessage = require("../constants/statusMessage.constant.js");
const commonConstant = require("../constants/common.constant.js");

const setAcceptFriend = async (req, res) => {
  const { token, user_id, is_accept } = req.query;
  const { _id } = req.jwtDecoded.data;
  try {
    if (!user_id) {
      throw Error("params");
    }
    var friendData = await User.findById(user_id);
    if (friendData) {
      throw Error("notexist");
    }
    var userData = await User.findById(_id);
    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
    });
  } catch (error) {
    if (error.message == "params") {
      return res.status(200).json({
        code: statusCode.PARAMETER_VALUE_IS_INVALID,
        message: statusMessage.PARAMETER_VALUE_IS_INVALID,
      });
    } else if (error.message == "notexist") {
      return res.status(200).json({
        code: statusCode.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
        message: statusMessage.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
      });
    } else {
      return res.status(200).json({
        code: statusCode.UNKNOWN_ERROR,
        message: statusMessage.UNKNOWN_ERROR,
      });
    }
  }
};

const getListSuggestedFriends = async (req, res) => {
  const { token, index, count } = req.query;
  try {
    if (!index || !count || count < 0) {
      throw Error("params");
    }
    // tìm các user chưa kết bạn
    //  tìm các user
    //  bỏ đi các user đã là bạn bè
    //  tính toán số bạn chung
    // trả về

    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
    });
  } catch (error) {
    if (error.message == "params") {
      return res.status(500).json({
        code: statusCode.PARAMETER_VALUE_IS_INVALID,
        message: statusMessage.PARAMETER_VALUE_IS_INVALID,
      });
    } else {
      return res.status(500).json({
        code: statusCode.UNKNOWN_ERROR,
        message: statusMessage.UNKNOWN_ERROR,
      });
    }
  }
};

const setRequestFriend = async (req, res) => {
  const { token, user_id } = req.query;
  const { _id } = req.jwtDecoded.data;
  try {
    if (!user_id || _id == user_id) {
      throw Error("params");
    }
    var newRequest = new Request({
      author: _id,
      receiver: user_id,
      created: Date.now(),
    });
    var userData = await User.findById(_id).populate({
      path: "sendRequestedFriends"
    });
    // console.log(userData)
    if (userData && userData.friends.length > commonConstant.LIMIT_FRIENDS) {
      throw Error("9994");
    }
    if (userData&& userData.sendRequestedFriends.receiver==user_id) {
      throw Error("notfound");
    }
    userData.sendRequestedFriends.push(newRequest._id);
    var receiverData = await User.findByIdAndUpdate(user_id, {
      $push: {
        requestedFriends: newRequest._id,
      },
    });
    if (!receiverData || !userData || receiverData.is_blocked || userData.is_blocked) {
      throw Error("notfound");
    }
    await userData.save();
    await newRequest.save();

    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
    });
  } catch (error) {
    console.log(error)
    if (error.message == "params") {
      return res.status(500).json({
        code: statusCode.PARAMETER_VALUE_IS_INVALID,
        message: statusMessage.PARAMETER_VALUE_IS_INVALID,
      });
    } else if (error.message == "9994") {
      return res.status(500).json({
        code: statusCode.NO_DATA_OR_END_OF_LIST_DATA,
        message: statusMessage.NO_DATA_OR_END_OF_LIST_DATA,
      });
    } else if (error.message == "notfound") {
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

module.exports = {
  setAcceptFriend,
  getListSuggestedFriends,
  setRequestFriend,
};
