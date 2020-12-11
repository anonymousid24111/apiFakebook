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

const cloud = require("../helpers/cloud.helper.js");

const statusCode = require("../constants/statusCode.constant.js");
const statusMessage = require("../constants/statusMessage.constant.js");

const getListPosts = async (req, res) => {
  var {
    token,
    user_id,
    in_campaign,
    camaign_id,
    latitude,
    longitude,
    last_id,
    index,
    count,
  } = req.query;
  const { _id } = req.userDataPass;
  // check params
  try {
    if (!index || !count) {
      // throw Error("params");
      index = 0;
      count = 20;
    }
    if(user_id){
      var resultData = await User.findById(user_id).populate({
        
        path: "postIds",
        populate: {
          path: "author",
          select: "username avatar",
        },
        populate: {
          path: "comment_list",
          populate:{
            path: "poster",
            select: "username avatar"
          }
          // select: "username avatar",
        },
        populate: {
          path: "like_list",
          select: "username avatar"
        },
        options: {
          sort: {
            created: -1,
          },
        },
      });
      return res.status(200).json({
        code: statusCode.OK,
        message: statusMessage.OK,
        data: resultData.postIds
      })
    }


    var result = await User.findById(_id).populate({
      path: "friends",
      select: "postIds",
      populate: {
        path: "postIds",
        populate: {
          path: "author",
          select: "avatar username",
        },
        options: {
          sort: {
            created: -1,
          },
        },
      },
    });
    var postRes = [];
    result.friends.map((e, index) => {
      postRes = postRes.concat(e.postIds);
      // console.log(postRes)
    });
    if (postRes.length==0) {
      throw Error("nodata");
    }
    function checkAdult(post) {
      return post._id == last_id;
    }
    var findLastIndex = postRes.findIndex(checkAdult);
    var new_items = 0;
    var newLastIndex;
    if (findLastIndex == -1) {
      new_items = postRes.length;
      // newLastIndex
    } else {
      new_items = findLastIndex;
    }
    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      data: {
        posts: postRes.slice(index, index + count),
        last_id: postRes[0]._id,
        new_items: postRes.length-count,
      },
    });
  } catch (error) {
    if (error.message == "params") {
      return res.status(200).json({
        code: statusCode.PARAMETER_VALUE_IS_INVALID,
        message: statusMessage.PARAMETER_VALUE_IS_INVALID,
      });
    } else if (error.message == "nodata") {
      return res.status(200).json({
        code: statusCode.NO_DATA_OR_END_OF_LIST_DATA,
        message: statusMessage.NO_DATA_OR_END_OF_LIST_DATA,
      });
    } else {
      console.log(error);
      return res.status(200).json({
        code: statusCode.UNKNOWN_ERROR,
        message: statusMessage.UNKNOWN_ERROR,
      });
    }
  }
};

const checkNewItem = async (req, res) => {
  const { last_id, category_id } = req.query;
  const { _id } = req.userDataPass;
  try {
    var result = await User.findById(_id).populate({
      path: "friends",
      select: "postIds",
      populate: {
        path: "postIds",
        // populate: {
        //   path: "author",
        //   select: "avatar username",
        // },
        options: {
          sort: {
            created: -1,
          },
        },
      },
    });
    var postRes = [];
    result.friends.map((e, index) => {
      postRes = postRes.concat(e.postIds);
      // console.log(postRes)
    });
    function checkAdult(post) {
      return post._id == last_id;
    }
    var findLastIndex = postRes.findIndex(checkAdult);
    var new_items = 0;
    var newLastIndex;
    if (findLastIndex == -1) {
      new_items = postRes.length;
      // newLastIndex
    } else {
      new_items = findLastIndex;
    }
    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      data: {
        // posts: postRes.slice(index, index + count),
        // last_id: postRes[0]._id,
        new_items: new_items,
      },
    });
  } catch (error) {
    if (error.message == "params") {
      return res.status(200).json({
        code: statusCode.PARAMETER_VALUE_IS_INVALID,
        message: statusMessage.PARAMETER_VALUE_IS_INVALID,
      });
    } else {
      return res.status(200).json({
        code: statusCode.UNKNOWN_ERROR,
        message: statusMessage.UNKNOWN_ERROR,
      });
    }
  }
};

module.exports = {
  getListPosts,
  checkNewItem,
};
