const dotenv = require("dotenv");
dotenv.config();
const fs = require("fs");
const saveFile = require("../helpers/saveFile.helper.js");
const formidable = require("formidable");
const { getVideoDurationInSeconds } = require('get-video-duration')
const Post = require("../models/post.model.js");
const statusCode = require("./../constants/statusCode.constant.js");
const statusMessage = require("./../constants/statusMessage.constant.js");
const User = require("../models/user.model.js");
const { basename } = require("path");
// const { ifError } = require( "assert");

const addPost = async (req, res) => {
  // const { token, image, video, described, status } = req.body;
  const { token, image, video, described, status } = req.query;
  const { _id, phonenumber } = req.jwtDecoded.data;

  // if()

  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    // console.log(files)
    if (err) {
      console.log("có lỗi không xác định", err);
      return res.status(200).json({
        code: statusCode.FILE_SIZE_IS_TOO_BIG,
        message: statusCode.FILE_SIZE_IS_TOO_BIG
      })
    }
    // số lượng file lớn hơn 4
    // console.log(files.video)
    
    // dung lượng video quá lớn
    if (files.video && files.video.size > 10 * 1024 * 1024) {
      await getVideoDurationInSeconds(files.video.path).then((duration) => {
        console.log(duration)
        if (duration < 1 || duration > 10) {
          return res.status(200).json({
            code: statusCode.FILE_SIZE_IS_TOO_BIG,
            message: statusCode.FILE_SIZE_IS_TOO_BIG
          })
        }
      })
      if (files.video.size > 10 * 1024 * 1024) {
        console.log("video vượt quá dung lượng cho phép 10MB");
        return res.status(200).json({
          code: statusCode.FILE_SIZE_IS_TOO_BIG,
          message: statusCode.FILE_SIZE_IS_TOO_BIG
        })
        
      }
    }
    //save posts of users
    var oldpath = "";
    var newpath = "";
    var typeFile = "";
    var imageList = [];
    var file = "";
    var sizeImageFile = 0;
    var sizeVideoFile = 0;
    var type = "";
    var videoName = "";
    for (const key in files) {
      type = files[key].type.split("/")[1];
      if (type == "jpeg" || type == "jpg" || type == "png") {
        sizeImageFile++;
        if (sizeImageFile > 4) {
          console.log("quá nhiều file");
          return await res.status(200).json({
            code: statusCode.FILE_SIZE_IS_TOO_BIG,
            message: statusMessage.FILE_SIZE_IS_TOO_BIG
          })
        }
      }
      if (type == "mp4" || type == "3pg") {
        sizeVideoFile++;
        if (sizeVideoFile > 1 || (sizeVideoFile == 1 && sizeImageFile > 0)) {
          console.log("quá nhiều file");
          return await res.status(200).json({
            code: statusCode.FILE_SIZE_IS_TOO_BIG,
            message: statusMessage.FILE_SIZE_IS_TOO_BIG
          })
        }
      }

    }
    for (const key in files) {
      if (files.hasOwnProperty(key)) {
        file = files[key];
        oldpath = file.path;
        typeFile = file.type.split("/")[1];
        newpath = `upload/post.${_id}${Date.now()}.${typeFile}`;
        try {
          await saveFile.saveFile(oldpath, newpath);
        } catch (error) {
          console.log(error)
        }
        if (type == "jpeg" || type == "jpg" || type == "png") {
          imageList.push(newpath);
        }
        else if (type == "mp4" || type == "3pg") {
          videoName = newpath;
          console.log("jafkldsjlfkajsdkl",videoName)
        }
      }
    }
    try {
      var newPost = await new Post({
        described: described,
        status: status,
        image: imageList,
        video: videoName,
        created: Date.now(),
        modified: Date.now(),
        like: 0,
        is_liked: false,
        comment: 0,
        // something else
      }).save()
      console.log(newPost)
      return res.status(200).json({
        code: statusCode.OK,
        message: statusMessage.OK,
        data: {
          id: newPost._id,
          described: newPost.described,
          created: newPost.created,
          modified: newPost.modified,
          like: newPost.like,
          comment: newPost.comment,
          is_liked: false,
        },
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        code: statusCode.EXCEPTION_ERROR,
        message: statusMessage.EXCEPTION_ERROR
      })
    }
    //save data what user send
  });

};
const getPost = async (req, res) => {
  const { token, id } = req.body;
  return res.status(200).json({
    code: statusCode.OK,
    message: statusMessage.OK,
    data: {
      id: "id",
    },
  });
};

module.exports = {
  addPost,
};
