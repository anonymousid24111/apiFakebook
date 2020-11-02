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

const statusCode = require("./../constants/statusCode.constant.js");
const statusMessage = require("./../constants/statusMessage.constant.js");

const addPost = async (req, res) => {
  const { token, image, video, described, state, can_edit, status } = req.query;
  const { _id, phonenumber } = req.jwtDecoded.data;
  // validate input 

  try {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      // console.log(files)
      if (err) {
        console.log("có lỗi không xác định", err);
        throw err;
      }
      // số lượng file lớn hơn 4
      // console.log(files.video)

      // dung lượng video quá lớn
      if (files.video && files.video.size > 10 * 1024 * 1024) {
        await getVideoDurationInSeconds(files.video.path).then((duration) => {
          console.log(duration)
          if (duration < 1 || duration > 10) {
            throw Error("FILE_SIZE_IS_TOO_BIG")
          }
        })
        if (files.video.size > 10 * 1024 * 1024) {
          console.log("video vượt quá dung lượng cho phép 10MB");
          throw Error("FILE_SIZE_IS_TOO_BIG")
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
            throw Error("FILE_SIZE_IS_TOO_BIG")
          }
        }
        if (type == "mp4" || type == "3pg") {
          sizeVideoFile++;
          if (sizeVideoFile > 1 || (sizeVideoFile == 1 && sizeImageFile > 0)) {
            console.log("quá nhiều file");
            throw Error("FILE_SIZE_IS_TOO_BIG")
          }
        }

      }
      for (const key in files) {
        if (files.hasOwnProperty(key)) {
          file = files[key];
          oldpath = file.path;
          typeFile = file.type.split("/")[1];
          newpath = `upload/post.${_id}${Date.now()}.${typeFile}`;
          await saveFile.saveFile(oldpath, newpath);
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
      // try {
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

      // } catch (error) {

      // }
      //save data what user send
    });

  } catch (error) {
    if (error.message == "FILE_SIZE_IS_TOO_BIG") {
      return res.status(500).json({
        code: statusCode.FILE_SIZE_IS_TOO_BIG,
        message: statusMessage.FILE_SIZE_IS_TOO_BIG
      })
    } else {
      // console.log(error);
      return res.status(500).json({
        code: statusCode.EXCEPTION_ERROR,
        message: statusMessage.EXCEPTION_ERROR
      })
    }
  }



};
const getPost = async (req, res) => {
  const { token, id } = req.query;
  const { _id } = req.jwtDecoded.data;
  try {
    if (!id) {
      throw Error("PARAMETER_VALUE_IS_INVALID")
    }
    else {
      var result = await Post.findById(id).populate({
        path: "author",
        select: "_id username avatar"
      });
      console.log(result);
      if (!result) {// không tìm thấy bài viết hoặc vi phạm tiêu chuẩn cộng đồng
        throw Error("POST_IS_NOT_EXISTED")
      } else {
        var resultUser = await User.findById(result.author._id);
        var block = false;
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
  }
  catch (error) {
    if (error.message == "POST_IS_NOT_EXISTED") {
      return res.status(200).json({
        code: statusCode.POST_IS_NOT_EXISTED,
        message: statusMessage.POST_IS_NOT_EXISTED
      })
    }
    else {
      return res.status(200).json({
        code: statusCode.UNKNOWN_ERROR,
        message: statusMessage.UNKNOWN_ERROR
      })
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
    }, (err) => {
      if (err) throw err;
    });
    if (!result) {
      console.log("Khong tim thay bai viet")
      throw Error("Post is not existed")
    }
    console.log("Successfully!")
    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
    })

  } catch (error) {
    if (error.message == "Post is not existed") {
      return res.status(200).json({
        code: statusCode.POST_IS_NOT_EXISTED,
        message: statusMessage.POST_IS_NOT_EXISTED
      })
    }
    else {
      return res.status(200).json({
        code: statusCode.UNKNOWN_ERROR,
        message: statusMessage.UNKNOWN_ERROR
      })
    }
  }
}

const reportPost = async (req, res) => {
  const { token, id, subject, details } = req.query;
  try {
    var result = await Post.findById(id, (err, docs) => {
      if (err) throw err;
    });
    if (!result) {
      throw Error("notfound");
    }
    else if (result.is_blocked) {
      throw Error("blocked")
    }
    else {
      await new ReportPost({
        id: id,
        subject: subject,
        details: details,
      }).save()
      return res.status(200).json({
        code: statusCode.OK,
        message: statusMessage.OK
      })
    }
  } catch (error) {
    if (error.message == "notfound") {
      return res.status(200).json({
        code: statusCode.POST_IS_NOT_EXISTED,
        message: statusMessage.POST_IS_NOT_EXISTED,
      })
    }
    else if (error.message == "blocked") {
      return res.status(200).json({
        code: statusCode.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
        message: statusMessage.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
      })
    }
    else {
      return res.status(200).json({
        code: statusCode.UNKNOWN_ERROR,
        message: statusMessage.UNKNOWN_ERROR,
      })
    }
  }
}

const like = async (req, res) => {
  const { token, id } = req.query;
  const { _id } = req.jwtDecoded.data;

  try {
    // tim post theo id
    var result = await Post.findById(id, (err, docs) => {
      if (err) throw err;
    });
    // neu khong co thi bao loi
    if (!result) {
      throw Error("notfound");
    }
    // kiem tra post có bị block không
    if (result.is_blocked) {
      throw Error("isblocked")
    }
    // nếu user đã like
    if (!result.like_list.includes(_id)) {
      // xoá user id khỏi danh sách đã like của post
      await Post.findByIdAndUpdate(id, {
        $pull: {
          like_list: _id
        }
      }, (err, docs) => {
        if (err) throw err;
      })
      return res.status(200).json({
        code: statusCode.OK,
        message: statusMessage.OK,
        data: {
          like: result.like - 1
        }
      }, (err, docs) => {
        if (err) throw err;
      })
    } else {
      // nếu user chưa like thì thêm user id vào danh sách post
      await Post.findByIdAndUpdate(id, {
        $push: {
          like_list: _id
        }
      }, (err, docs) => {
        if (err) throw err;
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


  // return res.status(200);
}

const getComment = async (req, res) => {
  const { token, id, count, index } = req.query;

  try {
    // kiểm tra input có null không
    if (!count || !index) {
      throw Error("params")
    }
    // tìm post theo id
    var postData = await Post.findOne({ _id: id }, (err, docs) => {
      if (err) throw err;
    }).populate({
      path: "comment_list",
      populate: {
        path: "poster",
        select: "_id username avatar"
      }
    });
    if (!postData) {
      // neu bai viet khong ton tai
      console.log("not found");
      throw Error("notfound");
    } else if (postData.is_blocked) {
      // bai viet bi khoa
      throw Error("blocked");
    } else {
      // neu khong co loi gi
      // kiem tra author bai viet cos block user khong
      var authorData = await User.findOne({ _id: postData.author }, (err, docs) => {
        if (err) throw err;
      });
      authorData.blockedIds.forEach((element) => {
        if (element == _id) {
          throw Error("authorblock");
        }
      })
      // kiểm tra user có block author bai viet không
      var userData = await User.findOne({ _id: _id }, (err, docs) => {
        if (err) throw err;
      });
      userData.blockedIds.forEach((element) => {
        if (element == postData.author) {
          throw Error("userblock");
        }
      });
      // nếu all ok

      var comment_list = postData.comment_list.filter(async element => {
        // kiểm tra author comment có block user không
        var authorDataComment = await User.findOne({ _id: element.author }, (err, docs) => {
          if (err) throw err;
        });
        // var flag = true;
        if (!authorDataComment.blockedIds.includes(_id) || !userData.blockedIds.includes(element.author)) {
          return false;
        } else {
          return true;
        }
      })

      res.status(200).json({
        code: statusCode.OK,
        message: statusMessage.OK,
        data: comment_list,
      })
    }
  } catch (err) {
    if (err.message == "params") {
      console.log("loi tham so");
      return res.status(200).json({
        code: statusCode.PARAMETER_VALUE_IS_INVALID,
        message: statusMessage.PARAMETER_VALUE_IS_INVALID
      })
    }
    else if (err.message == "notfound") {
      console.log("notfound");
      return res.status(200).json({
        code: statusCode.POST_IS_NOT_EXISTED,
        message: statusMessage.POST_IS_NOT_EXISTED
      })
    }
    else if (err.message == "blocked") {
      console.log("post is blocked");
      return res.status(200).json({
        code: statusCode.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
        message: statusMessage.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER
      })
    }
    else if (err.message == "authorblock") {
      console.log("authorblock");
      return res.status(200).json({
        code: statusCode.NOT_ACCESS,
        message: statusMessage.NOT_ACCESS
      })
    }
    else if (err.message == "userblock") {
      console.log("userblock");
      return res.status(200).json({
        code: statusCode.NOT_ACCESS,
        message: statusMessage.NOT_ACCESS
      })
    }
    else {
      console.log("unknown error");
      return res.status(200).json({
        code: statusCode.UNKNOWN_ERROR,
        message: statusMessage.UNKNOWN_ERROR
      })
    }
  }

  // res.status(200)
}

const setComment = async (req, res) => {
  const { token, id, comment, index, count } = req.query;
  const { _id } = req.jwtDecoded.data;
  // check params
  try {
    if (!comment || !id || !index || !count) {
      throw Error("params");
    }
    // tim bai viet
    var result = await Post.findOne({ _id: id }, (err, docs) => {
      if (err) throw err;
    })
    // neu khong tim thay bai viet
    if (!result) {
      throw Error("notfound")
    }
    // neu bai viet bi block
    if (result.is_blocked) {
      throw Error("action")
    }
    // tim author
    var authorData = await User.findOne({ _id: result.author }, (err, docs) => {
      if (err) throw err;
    });
    if (authorData.blockedIds.includes(_id)) {
      // neu author block user
      throw Error("blocked");
    }
    // tim user co block user k
    // tim user
    var userData = await User.findOne({ _id: _id }, (err, docs) => {
      if (err) throw err;
    })
    await userData.blockedIds.forEach((element) => {
      if (element == _id) {
        isblocked = "1"
      }
    })
    if (userData.blockedIds.includes(result.author)) {
      // neu author block user
      throw Error("notaccess");
    }
    var newcomment = await new Comment({
      // _id: mongoose.Schema.Types.ObjectId,
      author: _id,
      comment: comment,
      date: Date.now(),
    })
    newcomment.save((err) => {
      if (err) {
        throw err;
      }
      var kq = Post.findByIdAndUpdate(id, {
        $push: {
          comment_list: newcomment._id
        }
      }, (err2, docs) => {
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
  } catch (error) {
    if (error.message == "params") {
      return res.status(200).json({
        code: statusCode.PARAMETER_VALUE_IS_INVALID,
        message: statusMessage.PARAMETER_VALUE_IS_INVALID
      })
    } else if (error.message == "notfound") {
      return res.status(200).json({
        code: statusCode.POST_IS_NOT_EXISTED,
        message: statusMessage.POST_IS_NOT_EXISTED
      })
    } else if (error.message == "action") {
      return res.status(200).json({
        code: statusCode.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
        message: statusMessage.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER
      })
    } else if (error.message == "blocked") {
      return res.status(200).json({
        code: statusCode.NOT_ACCESS,
        message: statusMessage.NOT_ACCESS
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
  addPost,
  getPost,
  editPost,
  deletePost,
  reportPost,
  like,
  getComment,
  setComment,
};
