const dotenv = require("dotenv");
dotenv.config();
// const fs = require("fs");
// const formidable = require("formidable");
// const { getVideoDurationInSeconds } = require("get-video-duration");
// const mongoose = require("mongoose");

const Post = require("../models/post.model.js");
const User = require("../models/user.model.js");
const ReportPost = require("../models/report.post.model.js");
const Comment = require("../models/comment.model");

// const cloud = require("../helpers/cloud.helper.js");
const formidableHelper = require("../helpers/formidable.helper");
const cloudHelper = require("../helpers/cloud.helper.js");

const statusCode = require("./../constants/statusCode.constant.js");
const statusMessage = require("./../constants/statusMessage.constant.js");
// const { uploadImage } = require("../helpers/cloud.helper.js");

const addPost = async (req, res) => {
  const { token, image, video, described, state, can_edit, status } = req.query;
  const { _id, phonenumber } = req.jwtDecoded.data;
  // validate input
  formidableHelper
    .parse(req)
    .then(async (result) => {
      // console.log(result)
      if (result.type == "video") {
        await cloudHelper
          .upload(result.data[0], "video")
          .then(async (result2) => {
            var newPost = await new Post({
              described: described,
              state: state,
              status: status,
              video: result2,
              created: Date.now(),
              modified: Date.now(),
              like: 0,
              is_liked: false,
              comment: 0,
              author: _id,
            }).save();
            await User.findOneAndUpdate({_id: _id}, {
              $push: {
                postIds: newPost._id
              }
            })
            return res.status(200).json({
              code: statusCode.OK,
              message: statusMessage.OK,
              data: newPost,
            });
          })
          .catch((err) => {
            console.log(err);
            return res.status(200).json({
              code: statusCode.UNKNOWN_ERROR,
              message: statusMessage.UNKNOWN_ERROR,
            });
          });
      } else if (result.type == "image") {
        Promise.all(
          result.data.map((element) => {
            return cloudHelper.upload(element);
          })
        )
          .then(async (result2) => {
            console.log(result2);
            var newPost = await new Post({
              described: described,
              state: state,
              status: status,
              image: result2,
              created: Date.now(),
              modified: Date.now(),
              like: 0,
              is_liked: false,
              comment: 0,
              author: _id,
            }).save();
            return res.status(200).json({
              code: statusCode.OK,
              message: statusMessage.OK,
              data: newPost,
            });
          })
          .catch((err) => {
            console.log(err);
            return res.status(200).json({
              code: statusCode.UNKNOWN_ERROR,
              message: statusMessage.UNKNOWN_ERROR,
            });
          });
      } else if (result.type == "null") {
        var newPost = await new Post({
          described: described,
          state: state,
          status: status,
          created: Date.now(),
          modified: Date.now(),
          like: 0,
          is_liked: false,
          comment: 0,
          author: _id,
        }).save();
        return res.status(200).json({
          code: statusCode.OK,
          message: statusMessage.OK,
          data: newPost,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      if (err == statusCode.FILE_SIZE_IS_TOO_BIG) {
        return res.status(200).json({
          code: statusCode.FILE_SIZE_IS_TOO_BIG,
          message: statusMessage.FILE_SIZE_IS_TOO_BIG,
        });
      } else {
        return res.status(200).json({
          code: statusCode.UNKNOWN_ERROR,
          message: statusMessage.UNKNOWN_ERROR,
        });
      }
    });
};

const getPost = async (req, res) => {
  const { token, id } = req.query;
  const { _id } = req.jwtDecoded.data;
  try {
    if (!id) {
      throw Error("PARAMETER_VALUE_IS_INVALID");
    } else {
      var result = await Post.findOne({ _id: id }).populate({
        path: "author",
        select: "_id username avatar",
      });
      console.log(result);
      if (!result || result.is_blocked) {
        // không tìm thấy bài viết hoặc vi phạm tiêu chuẩn cộng đồng
        throw Error("POST_IS_NOT_EXISTED");
      } else {
        var resultUser = await User.findOne({ _id: result.author._id });
        var block = false;
        await resultUser.blockedIds.forEach((element) => {
          if (element == _id) {
            block = true;
          }
        });
        if (block) {
          return res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
            data: {
              isblocked: 1,
            },
          });
        } else {
          return res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
            data: result,
          });
        }
      }
    }
  } catch (error) {
    console.log(error.message);
    if (error.message == "POST_IS_NOT_EXISTED") {
      return res.status(200).json({
        code: statusCode.POST_IS_NOT_EXISTED,
        message: statusMessage.POST_IS_NOT_EXISTED,
      });
    } else {
      return res.status(200).json({
        code: statusCode.UNKNOWN_ERROR,
        message: statusMessage.UNKNOWN_ERROR,
      });
    }
  }
};

const editPost = async (req, res) => {
  const {
    token,
    id,
    described,
    status,
    state,
    image,
    image_del,
    image_sort,
    video,
    thumb,
    auto_block,
    auto_accept,
  } = req.query;
  try {
    // console.log(image_del, image_del.length, typeof image_del)
    if (
      !id ||
      (described && described.length > 500) ||
      (image_del && typeof image_del == "object" && image_del.length > 4) ||
      (image_sort && image_sort.length > 4)
    ) {
      throw Error("params");
    }
    const postData = await Post.findOne({ _id: id }, (err, docs) => {
      if (err) throw err;
    });
    formidableHelper
      .parse(req, postData)
      .then(async (result) => {
        var updateData = {};
        if (described) {
          postData.described = described;
        }
        if (status) {
          postData.status = status;
        }
        if (state) {
          postData.state = state;
        }
        if (status) {
          postData.status = status;
        }
        if (image_del && image_del.length > 0) {
          postData.image = postData.image.filter((element) => {
            if (image_del.includes(String(element._id))) {
              return false;
            } else {
              return true;
            }
          });
          // postData.image= data2;
          // console.log(image_del, postData.image)
        }
        if (result.type == "video") {
          cloudHelper
            .upload(result.data[0])
            .then(async (result2) => {
              updateData.video = result2;
              var editPost = await postData.save();
              return res.status(200).json({
                code: statusCode.OK,
                message: statusMessage.OK,
                data: editPost,
              });
            })
            .catch((err) => {
              throw err;
            });
        } else if (result.type == "image") {
          Promise.all(
            result.data.map((element) => {
              return cloudHelper.upload(element);
            })
          ).then(async (result2) => {
            // console.log(result2)
            postData.image =
              postData.image && postData.length == 0
                ? result2
                : postData.image.concat(result2);
            var editPost = await postData.save();
            return res.status(200).json({
              code: statusCode.OK,
              message: statusMessage.OK,
              data: editPost,
            });
          });
        } else if (result.type == "null") {
          var editPost = await postData.save();
          return res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
            data: editPost,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        return res.status(200).json({
          code: statusCode.FILE_SIZE_IS_TOO_BIG,
          message: statusMessage.FILE_SIZE_IS_TOO_BIG,
        });
      });
  } catch (error) {
    console.log(error);
    if (error.message == "params") {
      return res.status(200).json({
        code: statusCode.PARAMETER_VALUE_IS_INVALID,
        message: statusMessage.PARAMETER_VALUE_IS_INVALID,
      });
    } else if (error.message == "FILE_SIZE_IS_TOO_BIG") {
      return res.status(200).json({
        code: statusCode.FILE_SIZE_IS_TOO_BIG,
        message: statusMessage.FILE_SIZE_IS_TOO_BIG,
      });
    } else {
      return res.status(200).json({
        code: statusCode.UNKNOWN_ERROR,
        message: statusMessage.UNKNOWN_ERROR,
      });
    }
  }
};

const deletePost = async (req, res) => {
  const { token, id } = req.query;
  const { _id } = req.jwtDecoded.data;
  try {
    var result = await Post.findOneAndDelete({
      _id: id,
      author: _id,
    });
    if (!result) {
      console.log("Khong tim thay bai viet");
      throw Error("Post is not existed");
    }
    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
    });
  } catch (error) {
    if (error.message == "Post is not existed") {
      return res.status(200).json({
        code: statusCode.POST_IS_NOT_EXISTED,
        message: statusMessage.POST_IS_NOT_EXISTED,
      });
    } else {
      return res.status(200).json({
        code: statusCode.UNKNOWN_ERROR,
        message: statusMessage.UNKNOWN_ERROR,
      });
    }
  }
};

const reportPost = async (req, res) => {
  const { token, id, subject, details } = req.query;
  try {
    var result = await Post.findOne({ _id: id }, (err, docs) => {
      if (err) throw err;
    });
    if (!result) {
      throw Error("notfound");
    } else if (result.is_blocked) {
      throw Error("blocked");
    } else {
      await new ReportPost({
        id: id,
        subject: subject,
        details: details,
      }).save();
      return res.status(200).json({
        code: statusCode.OK,
        message: statusMessage.OK,
      });
    }
  } catch (error) {
    if (error.message == "notfound") {
      return res.status(200).json({
        code: statusCode.POST_IS_NOT_EXISTED,
        message: statusMessage.POST_IS_NOT_EXISTED,
      });
    } else if (error.message == "blocked") {
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

const like = async (req, res) => {
  const { token, id } = req.query;
  const { _id } = req.jwtDecoded.data;

  try {
    // tim post theo id
    var result = await Post.findOne({ _id: id }, (err, docs) => {
      if (err) throw err;
    });
    // neu khong co thi bao loi
    if (!result) {
      throw Error("notfound");
    }
    // kiem tra post có bị block không
    if (result.is_blocked) {
      throw Error("isblocked");
    }
    // nếu user đã like
    if (result.like_list.includes(String(_id))) {
      // xoá user id khỏi danh sách đã like của post
      await Post.findByIdAndUpdate(id, {
        $pull: {
          like_list: _id,
        },
        $set: {
          like: result.like - 1,
        },
      });
      return res.status(200).json({
        code: statusCode.OK,
        message: statusMessage.OK,
        data: {
          like: result.like - 1,
        },
      });
    } else {
      // nếu user chưa like thì thêm user id vào danh sách post
      await Post.findByIdAndUpdate(id, {
        $push: {
          like_list: _id,
        },
        $set: {
          like: result.like + 1,
        },
      });
      return res.status(200).json({
        code: statusCode.OK,
        message: statusMessage.OK,
        data: {
          like: result.like + 1,
        },
      });
    }
  } catch (error) {
    if (error.message == "isblocked") {
      console.log(error.message);
      return res.status(200).json({
        code: statusCode.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
        message: statusMessage.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
      });
    } else if (error.message == "notfound") {
      console.log(error.message);
      return res.status(200).json({
        code: statusCode.POST_IS_NOT_EXISTED,
        message: statusMessage.POST_IS_NOT_EXISTED,
      });
    } else {
      console.log(error.message);
      return res.status(200).json({
        code: statusCode.UNKNOWN_ERROR,
        message: statusMessage.UNKNOWN_ERROR,
      });
    }
  }

  // return res.status(200);
};

const getComment = async (req, res) => {
  const { token, id, count, index } = req.query;
  const { _id } = req.jwtDecoded.data;
  try {
    // kiểm tra input có null không
    if (!count || !index) {
      throw Error("params");
    }
    // tìm post theo id
    var postData = await Post.findOne({ _id: id }).populate({
      path: "comment_list",
      populate: {
        path: "poster",
        select: "_id username avatar",
      },
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
      var authorData = await User.findOne({ _id: postData.author });
      if (authorData.blockedIds.includes(String(_id))) {
        throw Error("authorblock");
      }
      // kiểm tra user có block author bai viet không
      var userData = await User.findOne({ _id: _id });
      if (userData.blockedIds.includes(String(postData.author))) {
        throw Error("userblock");
      }
      // nếu all ok
      Promise.all(
        postData.comment_list.map(async (element) => {
          const authorDataComment = await User.findOne({
            _id: element.poster,
          }).select("blockedIds");
          if (
            (authorDataComment.blockedIds &&
              authorDataComment.blockedIds.includes(String(_id))) ||
            userData.blockedIds.includes(String(element.poster._id))
          ) {
            return null;
          } else {
            return Promise.resolve(element);
          }
        })
      ).then((result3) => {
        console.log(result3);
        return res.status(200).json({
          code: statusCode.OK,
          message: statusMessage.OK,
          data: result3,
        });
      });
    }
  } catch (err) {
    console.log(err);
    if (err.message == "params") {
      console.log("loi tham so");
      return res.status(200).json({
        code: statusCode.PARAMETER_VALUE_IS_INVALID,
        message: statusMessage.PARAMETER_VALUE_IS_INVALID,
      });
    } else if (err.message == "notfound") {
      console.log("notfound");
      return res.status(200).json({
        code: statusCode.POST_IS_NOT_EXISTED,
        message: statusMessage.POST_IS_NOT_EXISTED,
      });
    } else if (err.message == "blocked") {
      console.log("post is blocked");
      return res.status(200).json({
        code: statusCode.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
        message: statusMessage.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
      });
    } else if (err.message == "authorblock") {
      console.log("authorblock");
      return res.status(200).json({
        code: statusCode.NOT_ACCESS,
        message: statusMessage.NOT_ACCESS,
      });
    } else if (err.message == "userblock") {
      console.log("userblock");
      return res.status(200).json({
        code: statusCode.NOT_ACCESS,
        message: statusMessage.NOT_ACCESS,
      });
    } else {
      console.log("unknown error");
      return res.status(200).json({
        code: statusCode.UNKNOWN_ERROR,
        message: statusMessage.UNKNOWN_ERROR,
      });
    }
  }

  // res.status(200)
};

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
    });
    // neu khong tim thay bai viet
    if (!result) {
      throw Error("notfound");
    }
    // neu bai viet bi block
    if (result.is_blocked) {
      throw Error("action");
    }
    // tim author
    var authorData = await User.findOne({ _id: result.author });
    if (authorData.blockedIds.includes(String(_id))) {
      // neu author block user
      throw Error("blocked");
    }
    // tim user co block author k
    // tim user
    var userData = await User.findOne({ _id: _id });
    if (userData.blockedIds.includes(String(result.author))) {
      // neu user block author
      throw Error("notaccess");
    }
    var newcomment = new Comment({
      // _id: mongoose.Schema.Types.ObjectId,
      poster: _id,
      comment: comment,
      created: Date.now(),
    });
    result.comment_list.push(newcomment._id);
    result.comment++;
    await result.save();
    await newcomment.save();
    console.log(newcomment);
    var result2 = await Post.findOne({ _id: id }, (err, docs) => {
      if (err) throw err;
    }).populate({
      path: "comment_list",
      // skip: index||1,
      options: { skip: 0, sort: { created: -1 }, limit: count },

      populate: {
        path: "poster",
        select: "_id avatar username created",
      },
    });

    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      data: result2.comment_list,
    });
  } catch (error) {
    console.log(error);
    if (error.message == "params") {
      return res.status(200).json({
        code: statusCode.PARAMETER_VALUE_IS_INVALID,
        message: statusMessage.PARAMETER_VALUE_IS_INVALID,
      });
    } else if (error.message == "notfound") {
      return res.status(200).json({
        code: statusCode.POST_IS_NOT_EXISTED,
        message: statusMessage.POST_IS_NOT_EXISTED,
      });
    } else if (error.message == "action") {
      return res.status(200).json({
        code: statusCode.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
        message: statusMessage.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
      });
    } else if (error.message == "blocked") {
      return res.status(200).json({
        code: statusCode.NOT_ACCESS,
        message: statusMessage.NOT_ACCESS,
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
  addPost,
  getPost,
  editPost,
  deletePost,
  reportPost,
  like,
  getComment,
  setComment,
};
