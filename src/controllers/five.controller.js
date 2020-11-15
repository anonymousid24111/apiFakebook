const dotenv = require("dotenv");
dotenv.config();
const fs = require("fs");
const formidable = require("formidable");
const { getVideoDurationInSeconds } = require('get-video-duration')
const mongoose = require("mongoose");

const Post = require("../models/post.model.js");
const User = require("../models/user.model.js");
const ReportPost = require("../models/report.post.model.js");
const Comment = require("../models/comment.model")

const cloud = require("../helpers/cloud.helper.js");

const statusCode = require("../constants/statusCode.constant.js");
const statusMessage = require("../constants/statusMessage.constant.js");

const getListPosts = async (req, res) => {
  const { token, user_id, in_campaign, camaign_id, latitude, longitude, last_id, index, count } = req.query;
  const { _id } = req.jwtDecoded.data;
  // check params
  try {
    if (!index || !count || !latitude || !longitude) {
      throw Error("params");
    }
    var result = await User.findById(_id).populated({
      path: "friends",
      select: "postIds",
      populate: {
        path: "postIds"
      }
    }).limit(count).sort({ created: 1 });
    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      data: result
    })
  } catch (error) {
    if (error.message == "params") {
      return res.status(200).json({
        code: statusCode.PARAMETER_VALUE_IS_INVALID,
        message: statusMessage.PARAMETER_VALUE_IS_INVALID
      })
    } else if (error.message == "nodata") {
      return res.status(200).json({
        code: statusCode.NO_DATA_OR_END_OF_LIST_DATA,
        message: statusMessage.NO_DATA_OR_END_OF_LIST_DATA
      })
    } else {
      return res.status(200).json({
        code: statusCode.UNKNOWN_ERROR,
        message: statusMessage.UNKNOWN_ERROR
      })
    }
  }
}

const checkNewItem = async (req, res)=>{
  const {last_id, category_id}= req.query;
  try {
    if(!last_id||!category_id){
      throw Error("params")
    }
    var postData = Post.find({}, (err, docs=>{
      if (err) throw err;
    })).sort({created: 1});
    var dataRes = [];
    // (await postData).forEach((element)=>{
    //   if(postData._id==element){
    //     // break;
    //   }
    //   else{
    //     dataRes.push(element);
    //   }
    // })
    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      data: dataRes,
    })

  } catch (error) {
    if (error.message== "params") {
      return res.status(200).json({
        code: statusCode.PARAMETER_VALUE_IS_INVALID,
        message: statusMessage.PARAMETER_VALUE_IS_INVALID
      })
    } else {
      return res.status(200).json({
        code: statusCode.UNKNOWN_ERROR,
        message: statusMessage.UNKNOWN_ERROR
      })
    }
  }
}

module.exports = {
  getListPosts,
  checkNewItem,
};
