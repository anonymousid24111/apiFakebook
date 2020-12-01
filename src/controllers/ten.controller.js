const dotenv = require("dotenv");
dotenv.config();
const fs = require("fs");
const formidable = require("formidable");
const { getVideoDurationInSeconds } = require("get-video-duration");
const mongoose = require("mongoose");

const Post = require("../models/post.model.js");
const User = require("../models/user.model.js");
const ReportPost = require("../models/report.post.model.js");
const Comment = require("../models/comment.model");

const sameFriendsHelper = require("../helpers/sameFriends.helper.js");

const formidableHelper = require("../helpers/formidable.helper.js");

const statusCode = require("../constants/statusCode.constant.js");
const statusMessage = require("../constants/statusMessage.constant.js");

const setUserInfo = async (req, res) => {
  const {
    token,
    username,
    decription,
    address,
    city,
    country,
    link,
  } = req.query;
  const {_id}= req.jwtDecoded.data;
  try {
    if (!username ||
      username.match(/[^a-z|A-Z|0-9|\s]/g) ||
      // username === phonenumber ||
      username.length < 6 ||
      username.length > 50||
      (decription&&decription.length>150)
    ) {
      throw Error("params")
    }
    var result = await formidableHelper.parseInfo(req);
    var userData = await User.findById(_id);
    userData.avatar = result.avatar?result.avatar.url:userData.avatar;
    userData.cover_image = result.cover_image?result.cover_image.url:userData.cover_image;
    userData.decription = decription?decription:userData.decription;
    userData.username = username?username:userData.username;
    userData.address = address?address:userData.address;
    userData.city = city?city:userData.city;
    userData.country = country?country:userData.country;
    userData.link = link?link:userData.link;
    await userData.save();
    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      data: {
        avatar: result.avatar?result.avatar.url:null,
        cover_image: result.cover_image?result.cover_image.url:null,
        country: country,
        link: "server không cho phép thay",
        decription: decription
      }
    })
  } catch (error) {
    console.log(error)
    if (error.message=="params") {
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

const getUserInfo = async (req, res) => {
  const { token, user_id } = req.query;
  const { _id } = req.jwtDecoded.data;
  try {
    // nếu tự xem thông tin của mình
    if (user_id == _id || !user_id) {
      console.log("trùng với id của user");
      var userData = await User.findById(_id);
      var listing = userData.friends.length;
      return res.status(200).json({
        code: statusCode.OK,
        message: statusMessage.OK,
        data: {
          ...userData,
          listing: listing,
        },
      });
    }
    // nếu xem thông tin của người khác
    var otherUserData = await User.findById(user_id).select(
      "username created decription avatar cover_image link address city country friends"
    );
    if (
      !otherUserData ||
      otherUserData.is_blocked ||
      otherUserData.blockedIds.includes(_id)
    ) {
      throw Error("notfound");
    }
    var listing = otherUserData.friends.length;
    var is_friend = otherUserData.friends.includes(_id);
    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      data: {
        ...otherUserData,
        listing: listing,
        is_friend: is_friend,
      },
    });
  } catch (error) {
    if (error.message == "notfound") {
      return res.status(500).json({
        code: statusCode.USER_IS_NOT_VALIDATED,
        message: statusMessage.USER_IS_NOT_VALIDATED,
      });
    } else {
      return res.status(500).json({
        code: statusCode.UNKNOWN_ERROR,
        message: statusMessage.UNKNOWN_ERROR,
      });
    }
  }
};

const getNotification = async (req, res) => {
  const { token, index, count } = req.query;
  const {_id}= req.jwtDecoded.data;
  try {
    index=index?index:0; 
    count=count?count:20;
    
    var userData = await User.findById(_id).populate({
      path: "notifications",
      // select: "username avatar",
    });
    return res.status(500).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      data: userData.notifications,
    });
  } catch (error) {
    return res.status(500).json({
      code: statusCode.UNKNOWN_ERROR,
      message: statusMessage.UNKNOWN_ERROR,
    });
  }
};

const setReadNotification = async (req, res) => {
  const { token, notification_id } = req.query;
  const {_id}= req.jwtDecoded.data;
  try {
    // var userData = await User.findByIdAndUpdate(_id, {

    // }).populate({
    //   path: "notifications",
    //   // select: "username avatar",
    // });
    return res.status(500).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      data: userData.notifications,
    });
  } catch (error) {
    return res.status(500).json({
      code: statusCode.UNKNOWN_ERROR,
      message: statusMessage.UNKNOWN_ERROR,
    });
  }
};

module.exports = {
  setUserInfo,
  getUserInfo,
  getNotification,
  setReadNotification
};
