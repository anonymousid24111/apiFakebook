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

const saveFile = require("../helpers/saveFile.helper.js");

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
    // mo ta
    // 
    // tìm danh sách bạn 
    // tìm tất cả bài viết của các bạn của user sắp xếp theo created lấy count 
    // test populate or query loop

    // 

    // var userData = await User.findById(_id, (err, docs)=>{
    //   if (err) throw err;
    // }).populate({
    //   path: "friends",
    //   populate: {
    //     path: "post"
    //   }
    // })
    // doing here
    // chưa làm đc tìm tạm 20 bài trong database
    var postData = await Post.find({}, (err, docs) => {
      if (err) throw err;
    }).limit(count).sort({ created: 1 });
    if (!postData) {
      throw Error("nodata");
    }
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
