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

const statusCode = require("../constants/statusCode.constant.js");
const statusMessage = require("../constants/statusMessage.constant.js");

const getRequestedFriends = async (req, res) => {
  const { token, index, count } = req.query;
  const { _id } = req.jwtDecoded.data;
  try {
    var userData = await User.findById(_id).populate({
      path: "requestedFriends.author",
      // select: "author._id author.username author.avatar",
    });
    //.limit(count).skip(index);
    // console.log(userData);
    Promise.all(
      userData.requestedFriends.map((element) => {
        return sameFriendsHelper.sameFriends(
          userData.friends,
          element.author._id
        );
      })
    )
      .then((result) => {
        // console.log(result);
        // console.log(userData.requestedFriends)
        var a = userData.requestedFriends.map((value, index) => {
          // let {_id, username, avatar} = value._doc.author;
          // console.log(value.author._id)
          return {
            _id: value.author._id || null,
            avatar: value.author.avatar || null,
            username: value.author.username || null,
            same_friend: result[index],
          };
        });
        // console.log(a)
        return res.status(200).json({
          code: statusCode.OK,
          message: statusMessage.OK,
          data: {
            request: a,
            total: userData.requestedFriends.length,
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
    console.log(error);
    return res.status(500).json({
      code: statusCode.UNKNOWN_ERROR,
      message: statusMessage.UNKNOWN_ERROR,
    });
  }
};

const getListVideos = async (req, res) => {
  const {
    token,
    user_id,
    in_campaign,
    campaign_id,
    latitude,
    longtitude,
    last_id,
    index,
    count,
  } = req.query;
  const {_id}= req.jwtDecoded.data;
  try {
    var postData = await Post.find({
      video: {
        $ne: null,
      },
    }).populate({
      path: "author",
      select: "username avatar"
    });
    var userData = await User.findById(_id);
    // user block athor
    var b = await Promise.all(postData.map(async (element, index)=>{
      var result = await User.findById(element.author._id);
      if (result.blockedIds.includes(_id)||userData.blockedIds.includes(element.author._id)) {
        console.log(false)
        return false;
      }
      console.log(true)
      return element;
    }))
    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      data: b.filter(x=>x!=false),
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      code: statusCode.UNKNOWN_ERROR,
      message: statusMessage.UNKNOWN_ERROR,
    });
  }
};

const getUserFriends = async (req, res) => {
  const { token } = req.query;
  const {_id}= req.jwtDecoded.data;
  try {
    var userData = await User.findById(_id);
    var resultSameFriend =await Promise.all(
      userData.friends.map((element) => {
        return sameFriendsHelper.sameFriends(
          userData.friends,
          element
        );
      })
    );
    // console.log(resultSameFriend)
    userData = await User.findById(_id).populate({
      path: "friends",
      select: "avatar username"
    });
    var a= userData.friends.map((value, index)=>{
      return{
        ...value._doc,
        same_friends: resultSameFriend[index],
      }
    })
    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      data: {
        friends: a,
        total: userData.friends.length,
      },
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      code: statusCode.UNKNOWN_ERROR,
      message: statusMessage.UNKNOWN_ERROR,
    });
  }
};

module.exports = {
  getRequestedFriends,
  getListVideos,
  getUserFriends,
};
