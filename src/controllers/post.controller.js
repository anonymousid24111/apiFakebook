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
const mongoose = require("mongoose");
const ReportPost = require("../models/report.post.model.js");
const Comment = require("../models/comment.model")
// const { basename } = require("path");
// const { ifError } = require( "assert");

const addPost = async (req, res) => {
  // const { token, image, video, described, status } = req.body;
  const { token, image, video, described, state, can_edit, status } = req.query;
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
          imageList.push({ url: newpath });
          console.log(imageList)
        }
        else if (type == "mp4" || type == "3pg") {
          videoName = { url: newpath };
          console.log("jafkldsjlfkajsdkl", videoName)
        }
      }
    }
    try {
      var newPost = await new Post({
        described: described,
        state: state,
        image: imageList,
        video: videoName,
        created: Date.now(),
        modified: Date.now(),
        like: 0,
        is_liked: false,
        comment: 0,
        author: _id,
        // something else
      }).save()
      console.log(newPost)
      return res.status(200).json({
        code: statusCode.OK,
        message: statusMessage.OK,
        data: {
          newPost
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
  const { token, id } = req.query;
  const { _id } = req.jwtDecoded.data;
  if (!id) {
    return res.status(200).json({
      code: statusCode.PARAMETER_VALUE_IS_INVALID,
      message: statusMessage.PARAMETER_VALUE_IS_INVALID,
    })
  }
  else {
    try {
      // tim bai viet
      var result = await Post.findById(id).populate({
        path: "author",
        select: "_id username avatar"
      });
      console.log(result);
    } catch (error) {
      return res.status(200).json({
        code: statusCode.POST_IS_NOT_EXISTED,
        message: statusMessage.POST_IS_NOT_EXISTED
      })
    }
    if (!result) {// không tìm thấy bài viết hoặc vi phạm tiêu chuẩn cộng đồng
      return res.status(200).json({
        code: statusCode.POST_IS_NOT_EXISTED,
        message: statusMessage.POST_IS_NOT_EXISTED
      })
    } else {
      // console.log(result.author._id, _id)
      var resultUser = await User.findById(result.author._id);
      var block = false;
      // tìm người dùng có trong danh sách block của author hay không
      await resultUser.blockedIds.forEach(element => {
        if (element == _id) {
          block = true;
        }
      });
      if (block) {
        return res.status(200).json({
          code: statusCode.OK,
          message: statusMessage.OK,
          data: {
            isblocked: 1
          }
        })
      } else {
        return res.status(200).json({
          code: statusCode.OK,
          message: statusMessage.OK,
          data: result
        })
      }
    }
  }
};

const editPost = async (req, res) => {
  const { token, id, described, status, state, image, image_del,
    image_sort, video, thumb, auto_block, auto_accept } = req.query;
  // doing
  return res.status(200)
}

const deletePost = async (req, res) => {
  const { token, id } = req.query;
  const { _id } = req.jwtDecoded.data;
  try {
    var result = await Post.findOneAndDelete({
      _id: id,
      author: _id,
    });
    if (!result) {
      console.log("Khong tim thay bai viet")
      throw Error("Post is not existed")
    }
    // if(result.author._id!=_id){
    //   console.log("khong phai chu bai viet")
    //   throw Error("Not access")
    // }

  } catch (error) {
    if (error.message == "Post is not existed") {
      return res.status(200).json({
        code: statusCode.POST_IS_NOT_EXISTED,
        message: statusMessage.POST_IS_NOT_EXISTED
      })
    }
    // else if (error.message=="Not access") {
    //   return res.status(200).json({
    //     code: statusCode.NOT_ACCESS,
    //     message: statusMessage.NOT_ACCESS
    //   })
    // }
    else {
      return res.status(200).json({
        code: statusCode.UNKNOWN_ERROR,
        message: statusMessage.UNKNOWN_ERROR
      })
    }
  }
  // doing
  console.log("Successfully!")
  return res.status(200).json({
    code: statusCode.OK,
    message: statusMessage.OK,
  })
}

const reportPost = async (req, res) => {
  const { token, id, subject, details } = req.query;
  try {
    var result = await Post.findById(id);
    if (!result) {
      console.log("Khong tim thay bai viet")
      return res.status(200).json({
        code: statusCode.POST_IS_NOT_EXISTED,
        message: statusMessage.POST_IS_NOT_EXISTED,
      })
    } else {
      if (result.is_blocked) {
        return res.status(200).json({
          code: statusCode.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
          message: statusMessage.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
        })
      }
      else {
        try {
          await new ReportPost({
            id: id,
            subject: subject,
            details: details,
          }).save()
          return res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK
          })
        } catch (error) {
          return res.status(200).json({
            code: statusCode.UNKNOWN_ERROR,
            message: statusMessage.UNKNOWN_ERROR
          })
        }
      }
    }
  } catch (error) {
    return res.status(200).json({
      code: statusCode.POST_IS_NOT_EXISTED,
      message: statusMessage.POST_IS_NOT_EXISTED,
    })
  }
  // return res.status(200)
}

const like = async (req, res) => {
  const { token, id } = req.query;
  const { _id } = req.jwtDecoded.data;

  try {
    var result = await Post.findById(id, (err, docs) => {
      if (err) {
        throw err;
      }
    });
    if (!result) {
      throw Error("notfound");
    }
    var isliked = "0";
    if (result.is_blocked) {
      throw Error("isblocked")
    }
    await result.like_list.forEach(element => {
      if (element == _id) {
        isliked = "1";
      }
    });
    if (isliked == "1") {
      await Post.findByIdAndUpdate(id, {
        $pull: {
          like_list: _id
        }
      }, (err, docs) => {
        if (err) {
          throw err;
        }
      })
      return res.status(200).json({
        code: statusCode.OK,
        message: statusMessage.OK,
        data: {
          like: result.like - 1
        }
      }, (err, docs) => {
        if (err) {
          throw err;
        }
      })
    } else {
      await Post.findByIdAndUpdate(id, {
        $push: {
          like_list: _id
        }
      }, (err, docs) => {
        if (err) {
          throw err;
        }
      })
      return res.status(200).json({
        code: statusCode.OK,
        message: statusMessage.OK,
        data: {
          like: result.like + 1
        }
      })
    }

  } catch (error) {
    if (error.message == "isblocked") {
      console.log(error.message);
      return res.status(200).json({
        code: statusCode.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
        message: statusMessage.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER
      })
    } else if (error.message == "notfound") {
      console.log(error.message);
      return res.status(200).json({
        code: statusCode.POST_IS_NOT_EXISTED,
        message: statusMessage.POST_IS_NOT_EXISTED
      })
    } else {
      console.log(error.message);
      return res.status(200).json({
        code: statusCode.UNKNOWN_ERROR,
        message: statusMessage.UNKNOWN_ERROR
      })
    }
  }


  return res.status(200);
}

const getComment = async (req, res)=>{
  const {token, id, count, index} = req.query;

  try {
    if(!count||!index){
      throw Error("params")
    }
    var postData = await Post.findOne({_id: id}, (err, docs)=>{
      if (err) throw err;
    });
    if (!postData) {// bai viet khong ton tai
      console.log("not found");
      return res.status(200).json({
        code: statusCode.POST_IS_NOT_EXISTED,
        message: statusMessage.POST_IS_NOT_EXISTED
      })
    } else if (postData.is_blocked) {// bai viet bi khoa
      console.log("post is blocked");
      return res.status(200).json({
        code: statusCode.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
        message: statusMessage.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER
      })
    } else {
      res.status(200)//doing here
    }
  } catch (err) {
    if (err.message=="params") {
      console.log("loi tham so");
      return res.status(200).json({
        code: statusCode.PARAMETER_VALUE_IS_INVALID,
        message: statusMessage.PARAMETER_VALUE_IS_INVALID
      })
    }
    else{
      console.log("unknown error");
      return res.status(200).json({
        code: statusCode.UNKNOWN_ERROR,
        message: statusMessage.UNKNOWN_ERROR
      })
    }
  }

  res.status(200)
}

const setComment = async (req, res)=>{
  const { token, id, comment, index, count} = req.query;
  // check params
  if(!comment||!id||!index||!count){
    console.log("params error");
    return res.status(200).json({
      code: statusCode.PARAMETER_VALUE_IS_INVALID,
      message: statusMessage.PARAMETER_VALUE_IS_INVALID,
    })
  }else{// params OK
    const { _id}= req.jwtDecoded.data;
    try {
      // tim bai viet
      var result = await Post.findOne({_id: id}, (err, docs)=>{
        if (err) {
          throw err;
        }
      })
      // tim author
      var userData = await User.findOne({_id: result.author}, (err, docs)=>{
        if (err) {
          throw err;
        }
      });
      var isblocked = "0";
      // tim author co block user k
      await userData.blockedIds.forEach((element)=>{
        if (element==_id) {
          isblocked= "1"
        }
      })
      if (isblocked=="1") {// neu author block user
        console.log("author blocked you");
        return res.status(200).json({
          code: statusCode.NOT_ACCESS,
          message: statusMessage.NOT_ACCESS,
        })
      }
      // tim user co block user k
      await userData.blockedIds.forEach((element)=>{
        if (element==_id) {
          isblocked= "1"
        }
      })
      if (isblocked=="1") {// neu author block user
        console.log("author blocked you");
        return res.status(200).json({
          code: statusCode.NOT_ACCESS,
          message: statusMessage.NOT_ACCESS,
        })
      }
      if(!result){// neu ko tim thay bai viet
        console.log("not found");
        return res.status(200).json({
          code: statusCode.POST_IS_NOT_EXISTED,
          message: statusMessage.POST_IS_NOT_EXISTED,
        })
      }
      else if (result.is_blocked=="1") {// neu bai biet bi block boi server
        console.log("this post is blocked by server");
        return res.status(200).json({
          code: statusCode.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
          message: statusMessage.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
        });
      }
      else{
        var newcomment = await new Comment({
          // _id: mongoose.Schema.Types.ObjectId,
          author: _id,
          comment: comment,
          date: Date.now(),
        })
        newcomment.save((err)=>{
          if (err) {
            throw err;
          }
          var kq = Post.findByIdAndUpdate(id,{
            $push: {
              comment_list: newcomment._id
            }
          }, (err2, docs)=>{
            if (err2) {
              throw err2;
            }
            console.log(docs)
          })
        });
        console.log(newcomment)
        
        
        return res.status(200).json({
          code: statusCode.OK,
          message: statusMessage.OK
        })
      }
    } catch (error) {
      if(0){//neu k co loi
        return res.status(200).json({
          code: statusCode.OK,
          message: statusMessage.OK
        })
      }else{
        console.log(error.message);
        return res.status(200).json({
          code: statusCode.UNKNOWN_ERROR,
          message: statusMessage.UNKNOWN_ERROR,
        });
      }
    }
    // res.status(200)

  }

}


module.exports = {
  addPost,
  getPost,
  editPost,
  deletePost,
  reportPost,
  like,
  getComment,
  setComment,
};
